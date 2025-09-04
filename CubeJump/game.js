// Module aliases
const { Engine, Render, Runner, Bodies, Composite, Events, Body, Vector } = Matter;

// Create engine
const engine = Engine.create();
const world = engine.world;
engine.world.gravity.y = 1;

// Create renderer
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: '#1a1a1a'
    }
});
Render.run(render);

// Create runner
const runner = Runner.create();
Runner.run(runner, engine);

// Game variables
let player;
const platforms = [];
const effectParticles = [];
const keys = { left: false, right: false, up: false, boost: false };
let upPressedLastFrame = false; // Track up key for jump edge detection
let playerOnGround = false;
let highestY = window.innerHeight;
let score = 0;
const scoreElement = document.getElementById('score');
let highScore = localStorage.getItem('highScore') || 0;
const highScoreElement = document.getElementById('high-score');
highScoreElement.innerText = `High Score: ${highScore}`;
const platformWidth = 120;
const platformHeight = 20;
const platformGap = 180;

// Player face variables
let isSquinting = false;
let squintTimer = 0;
const squintDuration = 20; // Frames to show squint face

// Boost variables
let boostPower = 100;
const maxBoostPower = 100;
const boostRechargeRate = 0.5;
const boostDepletionRate = 1.5;
const boostForce = 0.2 * 0.1; // 90% slower boost
const boostMeter = document.getElementById('boost-meter');

// Utility to get a random color
function getRandomColor() {
    // Generate a random hex color
    return '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
}

// Custom render function for player with face
function renderPlayer(body, ctx) {
    const width = 40;
    const height = 40;
    
    // Draw cube body
    ctx.fillStyle = body.render.fillStyle;
    ctx.beginPath();
    ctx.rect(-(width / 2), -(height / 2), width, height);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000';
    ctx.stroke();
    
    // Draw face
    const eyeSize = 6;
    const mouthWidth = 14;
    const mouthHeight = isSquinting ? 2 : 6;

    // Draw eyes
    ctx.fillStyle = '#000';
    
    // Left eye
    if (isSquinting) {
        // Squinting left eye (line)
        ctx.beginPath();
        ctx.rect(-15, -5, 10, 2);
        ctx.fill();
    } else {
        // Normal left eye (circle)
        ctx.beginPath();
        ctx.arc(-10, -5, eyeSize/2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Right eye
    if (isSquinting) {
        // Squinting right eye (line)
        ctx.beginPath();
        ctx.rect(5, -5, 10, 2);
        ctx.fill();
    } else {
        // Normal right eye (circle)
        ctx.beginPath();
        ctx.arc(10, -5, eyeSize/2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Draw mouth
    ctx.beginPath();
    if (isSquinting) {
        // Grimacing mouth
        ctx.rect(-mouthWidth/2, 8, mouthWidth, mouthHeight);
    } else {
        // Normal mouth (smile)
        ctx.arc(0, 5, mouthWidth/2, 0, Math.PI);
    }
    ctx.fill();
}

// Create player
player = Bodies.rectangle(
    window.innerWidth / 2,
    window.innerHeight - 100,
    40,
    40,
    {
        friction: 0.01,
        restitution: 0,
        density: 0.005,
        render: {
            fillStyle: getRandomColor(),
            sprite: {
                xScale: 1,
                yScale: 1
            },
            visualComponent: renderPlayer
        },
        label: 'player'
    }
);
Composite.add(world, player);

// Generate initial platforms
function generatePlatforms(startY, count) {
    for (let i = 0; i < count; i++) {
        const y = startY - (i * platformGap);
        const x = Math.random() * (window.innerWidth - platformWidth);
        const platform = Bodies.rectangle(x + platformWidth / 2, y, platformWidth, platformHeight, {
            isStatic: true,
            render: { fillStyle: '#ddd' },
            label: 'platform'
        });
        platforms.push(platform);
        Composite.add(world, platform);
    }
    highestY = startY - (count * platformGap);
}

// Ground platform
const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 5, window.innerWidth, 20, {
    isStatic: true,
    render: { fillStyle: '#ddd' },
    label: 'platform'
});
platforms.push(ground);
Composite.add(world, ground);

// Initial set of platforms
generatePlatforms(window.innerHeight - platformGap, 20);

// Player controls
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') keys.left = true;
    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') keys.right = true;
    if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') keys.up = true;
    if (e.key === ' ' || e.code === 'Space') keys.boost = true;
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') keys.left = false;
    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') keys.right = false;
    if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') keys.up = false;
    if (e.key === ' ' || e.code === 'Space') keys.boost = false;
});

// Collision detection for ground status
function checkGround(pairs) {
    for (const pair of pairs) {
        const { bodyA, bodyB } = pair;
        if (bodyA.label === 'player' || bodyB.label === 'player') {
            const platform = bodyA.label === 'platform' ? bodyA : (bodyB.label === 'platform' ? bodyB : null);
            if (platform) {
                // Check if player is on top of the platform
                if (Math.abs(player.position.y - platform.position.y) < (40 / 2 + platformHeight / 2 + 5) && player.velocity.y >= 0) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Collision detection for effects
Events.on(engine, 'collisionStart', (event) => {
    const pairs = event.pairs;
    for (const pair of pairs) {
        const { bodyA, bodyB } = pair;
        if ((bodyA.label === 'player' && bodyB.label === 'platform') || (bodyB.label === 'player' && bodyA.label === 'platform')) {
            const platform = bodyA.label === 'platform' ? bodyA : bodyB;
            // Smash effect on hard landing
            if (player.velocity.y > 10) {
                // Set squinting face when impact is hard
                isSquinting = true;
                squintTimer = squintDuration;
                
                const particleCount = 10;
                for (let i = 0; i < particleCount; i++) {
                    // Player smash particles
                    const x = player.position.x + (Math.random() - 0.5) * 40;
                    const y = player.position.y + 20;
                    const particle = Bodies.rectangle(x, y, 5 + Math.random() * 5, 5 + Math.random() * 5, {
                        friction: 0.1,
                        restitution: 0.5,
                        render: { fillStyle: '#ccc' },
                        label: 'effect'
                    });
                    Body.setVelocity(particle, {
                        x: (Math.random() - 0.5) * 10,
                        y: -Math.random() * 5
                    });
                    effectParticles.push(particle);
                    Composite.add(world, particle);

                    // Platform shatter particles
                    const shatterX = player.position.x + (Math.random() - 0.5) * platform.bounds.max.x - platform.bounds.min.x;
                    const shatterY = platform.position.y - platformHeight / 2;
                    const shatterParticle = Bodies.rectangle(shatterX, shatterY, 3 + Math.random() * 3, 3 + Math.random() * 3, {
                        friction: 0.05,
                        restitution: 0.1,
                        render: { fillStyle: '#ddd' },
                        label: 'effect'
                    });
                    Body.setVelocity(shatterParticle, {
                        x: (Math.random() - 0.5) * 3,
                        y: -Math.random() * 2
                    });
                    effectParticles.push(shatterParticle);
                    Composite.add(world, shatterParticle);
                }
            }
        }
    }
});

// Game loop
Events.on(engine, 'beforeUpdate', () => {
    playerOnGround = checkGround(engine.pairs.list.filter(p => p.isActive));

    // Player movement
    const velocity = player.velocity;
    let newVelocityX = 0;
    if (keys.left) newVelocityX = -5;
    if (keys.right) newVelocityX = 5;
    
    Body.setVelocity(player, { x: newVelocityX, y: velocity.y });

    // Jump only on up key press (not hold), and not if using boost
    if (keys.up && playerOnGround && !upPressedLastFrame) {
        Body.applyForce(player, player.position, { x: 0, y: -1.1 * 0.4 * 1.2 });
    }
    upPressedLastFrame = keys.up;

    // Boost logic: only boost if not on ground
    if (keys.boost && boostPower > 0 && !playerOnGround) {
        Body.applyForce(player, player.position, { x: 0, y: -boostForce });
        boostPower -= boostDepletionRate;
        
        // Boost particles
        for (let i = 0; i < 2; i++) {
            const x = player.position.x + (Math.random() - 0.5) * 30;
            const y = player.position.y + 20 + Math.random() * 5;
            const boostParticle = Bodies.rectangle(x, y, 3, 10 + Math.random() * 10, {
                isSensor: true,
                render: { fillStyle: 'rgba(77, 255, 255, 0.7)' },
                label: 'effect'
            });
            Body.setVelocity(boostParticle, { x: (Math.random() - 0.5) * 1, y: Math.random() * 2 + 2 });
            effectParticles.push(boostParticle);
            Composite.add(world, boostParticle);
        }
    } else if (boostPower < maxBoostPower) {
        // Recharge boost when not boosting
        boostPower = Math.min(boostPower + boostRechargeRate, maxBoostPower);
    }
    
    // Update boost meter display
    boostMeter.style.width = `${(boostPower / maxBoostPower) * 100}%`;

    // Wind effects when falling
    if (player.velocity.y > 5) { // Add wind effect when falling fast
        const particleCount = Math.floor(player.velocity.y / 10);
        for (let i = 0; i < particleCount; i++) {
            const x = player.position.x + (Math.random() - 0.5) * 40;
            const y = player.position.y + 20 + Math.random() * 20;
            const windParticle = Bodies.rectangle(x, y, 2, 10 + Math.random() * 10, {
                isSensor: true,
                render: { fillStyle: 'rgba(255, 255, 255, 0.5)' },
                label: 'effect'
            });
            Body.setVelocity(windParticle, { x: (Math.random() - 0.5) * 2, y: -player.velocity.y * (Math.random() * 0.2 + 0.2) });
            effectParticles.push(windParticle);
            Composite.add(world, windParticle);
        }
    }

    // Wind effects when jumping
    if (player.velocity.y < -5) { // Add wind effect when jumping fast
        const particleCount = Math.floor(-player.velocity.y / 5);
        for (let i = 0; i < particleCount; i++) {
            const x = player.position.x + (Math.random() - 0.5) * 40;
            const y = player.position.y - 20 - Math.random() * 20;
            const jumpParticle = Bodies.rectangle(x, y, 2, 10 + Math.random() * 10, {
                isSensor: true,
                render: { fillStyle: 'rgba(255, 255, 255, 0.4)' },
                label: 'effect'
            });
            Body.setVelocity(jumpParticle, { x: (Math.random() - 0.5) * 2, y: -player.velocity.y * (Math.random() * 0.1 + 0.1) });
            effectParticles.push(jumpParticle);
            Composite.add(world, jumpParticle);
        }
    }

    // Update and remove effect particles
    for (let i = effectParticles.length - 1; i >= 0; i--) {
        const particle = effectParticles[i];
        if (!particle.render.opacity) particle.render.opacity = 1;
        
        if (particle.isSensor) { // Wind/jump particles
            particle.render.opacity -= 0.02;
        } else { // Smash/shatter particles
            particle.render.opacity -= 0.01; // Slower fade out
        }

        if (particle.render.opacity <= 0 || particle.position.y > player.position.y + window.innerHeight) {
            Composite.remove(world, particle);
            effectParticles.splice(i, 1);
        }
    }

    // Camera follow
    const cameraY = player.position.y - window.innerHeight / 2;
    Render.lookAt(render, {
        min: { x: 0, y: cameraY },
        max: { x: window.innerWidth, y: cameraY + window.innerHeight }
    });

    // Infinite generation
    if (player.position.y < highestY + window.innerHeight) {
        generatePlatforms(highestY, 20);
    }
    
    // Player wrap around screen
    if (player.position.x > window.innerWidth + 20) {
        Body.setPosition(player, { x: -20, y: player.position.y });
    } else if (player.position.x < -20) {
        Body.setPosition(player, { x: window.innerWidth + 20, y: player.position.y });
    }

    // Update score
    score = Math.floor((window.innerHeight - 100 - player.position.y) / 10);
    if (score < 0) score = 0; // Prevent score from going negative
    scoreElement.innerText = `Score: ${score}`;

    if (score > highScore) {
        highScore = score;
        highScoreElement.innerText = `High Score: ${highScore}`;
        localStorage.setItem('highScore', highScore);
    }

    // Update squint timer
    if (isSquinting) {
        squintTimer--;
        if (squintTimer <= 0) {
            isSquinting = false;
        }
    }
});

// Override the default render
// Add this after your existing render setup
Events.on(render, 'afterRender', function() {
    const bodies = Composite.allBodies(world);
    const context = render.context;
    
    context.save();
    
    // Adjust the context for camera position
    const viewportCenterX = render.options.width * 0.5;
    const viewportCenterY = render.options.height * 0.5;
    
    bodies.forEach(body => {
        if (body.render.visualComponent) {
            const { x, y } = body.position;
            const initialX = x - render.bounds.min.x;
            const initialY = y - render.bounds.min.y;
            
            context.save();
            context.translate(initialX, initialY);
            context.rotate(body.angle);
            
            // Call the custom render function
            body.render.visualComponent(body, context);
            
            context.restore();
        }
    });
    
    context.restore();
});

// Handle window resize
window.addEventListener('resize', () => {
    render.canvas.width = window.innerWidth;
    render.canvas.height = window.innerHeight;
    render.options.width = window.innerWidth;
    render.options.height = window.innerHeight;
    Body.setPosition(ground, {x: window.innerWidth / 2, y: window.innerHeight + 5});
});
