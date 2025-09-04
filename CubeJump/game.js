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
const interactiveElements = []; // Array to track interactive cubes
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

// Platform types
const PLATFORM_TYPES = {
    REGULAR: 'regular',
    RAMP_LEFT: 'ramp_left',
    RAMP_RIGHT: 'ramp_right',
    INTERACTIVE: 'interactive',
    BOUNCY: 'bouncy',
    MOVING: 'moving',
    CRUMBLING: 'crumbling',
    NARROW: 'narrow',
    MULTI_LEVEL: 'multi_level',
    FLOATING_OBJECTS: 'floating_objects'
};

// Moving platform tracking
const movingPlatforms = [];

// Interactive object colors
const CUBE_COLORS = ['#eee', '#f5d442', '#f54242', '#42f5a7', '#42a7f5', '#d642f5', '#f542a7'];

// Player face variables
let isSquinting = false;
let squintTimer = 0;
const squintDuration = 20; // Frames to show squint face

// Boost variables
let boostPower = 100;
const maxBoostPower = 100;
const boostRechargeRate = 0.5 / 3; // 3x slower recharge
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

// Create a regular platform
function createRegularPlatform(x, y) {
    const platform = Bodies.rectangle(x + platformWidth / 2, y, platformWidth, platformHeight, {
        isStatic: true,
        render: { fillStyle: '#ddd' },
        label: 'platform'
    });
    return platform;
}

// Create a ramp platform (triangle)
function createRampPlatform(x, y, isLeftFacing) {
    // Create a triangular ramp
    const vertices = isLeftFacing 
        ? [ 
            { x: 0, y: 0 },
            { x: platformWidth, y: 0 },
            { x: platformWidth, y: platformHeight }
        ] 
        : [ 
            { x: 0, y: 0 },
            { x: platformWidth, y: 0 },
            { x: 0, y: platformHeight }
        ];
    
    const ramp = Bodies.fromVertices(x + platformWidth / 2, y + platformHeight / 2, [vertices], {
        isStatic: true,
        render: { fillStyle: '#ddd' },
        label: 'platform',
        chamfer: { radius: 2 }
    });
    
    return ramp;
}

// Create a bouncy platform
function createBouncyPlatform(x, y) {
    const platform = Bodies.rectangle(x + platformWidth / 2, y, platformWidth, platformHeight, {
        isStatic: true,
        restitution: 1.5,
        render: { 
            fillStyle: '#ddd',
            sprite: {
                texture: createBouncyPattern(),
                xScale: 1,
                yScale: 1
            }
        },
        label: 'bouncy_platform'
    });
    return platform;
}

// Create a pattern for bouncy platforms
function createBouncyPattern() {
    const canvas = document.createElement('canvas');
    canvas.width = platformWidth;
    canvas.height = platformHeight;
    const ctx = canvas.getContext('2d');
    
    // Base white color
    ctx.fillStyle = '#ddd';
    ctx.fillRect(0, 0, platformWidth, platformHeight);
    
    // Add spring-like pattern
    ctx.strokeStyle = '#bbb';
    ctx.lineWidth = 2;
    
    for (let i = 10; i < platformWidth - 10; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 2);
        ctx.lineTo(i, platformHeight - 2);
        ctx.stroke();
        
        // Zigzag pattern
        ctx.beginPath();
        ctx.moveTo(i + 10, 2);
        for (let j = 5; j < platformHeight; j += 5) {
            ctx.lineTo(i + 5, j);
            ctx.lineTo(i + 15, j + 5);
        }
        ctx.stroke();
    }
    
    return canvas.toDataURL();
}

// Create a moving platform
function createMovingPlatform(x, y) {
    const platform = Bodies.rectangle(x + platformWidth / 2, y, platformWidth, platformHeight, {
        isStatic: true,
        render: { 
            fillStyle: '#ddd',
            lineWidth: 1,
            strokeStyle: '#aaa'
        },
        label: 'moving_platform'
    });
    
    // Add movement properties
    platform.movementRange = Math.random() * 200 + 100; // 100-300px range
    platform.movementSpeed = (Math.random() * 1 + 0.5) * (Math.random() < 0.5 ? 1 : -1); // 0.5-1.5 speed, random direction
    platform.initialX = platform.position.x;
    
    movingPlatforms.push(platform);
    return platform;
}

// Create a crumbling platform
function createCrumblingPlatform(x, y) {
    const platform = Bodies.rectangle(x + platformWidth / 2, y, platformWidth, platformHeight, {
        isStatic: true,
        render: { fillStyle: '#ccc' },
        label: 'crumbling_platform',
        isCrumbling: false,
        crumbleTimer: 30 // Frames before platform disappears after landing
    });
    
    // Add crack pattern
    const canvas = document.createElement('canvas');
    canvas.width = platformWidth;
    canvas.height = platformHeight;
    const ctx = canvas.getContext('2d');
    
    // Base color
    ctx.fillStyle = '#ddd';
    ctx.fillRect(0, 0, platformWidth, platformHeight);
    
    // Add cracks
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    
    const crackCount = 5 + Math.floor(Math.random() * 5);
    for (let i = 0; i < crackCount; i++) {
        const startX = Math.random() * platformWidth;
        const startY = 0;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        let currentX = startX;
        let currentY = startY;
        
        const segments = 5 + Math.floor(Math.random() * 5);
        for (let j = 0; j < segments; j++) {
            currentX += (Math.random() - 0.5) * 15;
            currentY += platformHeight / segments;
            ctx.lineTo(currentX, currentY);
        }
        
        ctx.stroke();
    }
    
    platform.render.sprite = {
        texture: canvas.toDataURL(),
        xScale: 1,
        yScale: 1
    };
    
    return platform;
}

// Create a narrow platform
function createNarrowPlatform(x, y) {
    const narrowWidth = platformWidth / 2;
    const platform = Bodies.rectangle(x + narrowWidth / 2, y, narrowWidth, platformHeight, {
        isStatic: true,
        render: { fillStyle: '#ddd' },
        label: 'platform'
    });
    return platform;
}

// Create a multi-level platform
function createMultiLevelPlatform(x, y) {
    const mainPlatform = Bodies.rectangle(x + platformWidth / 2, y, platformWidth, platformHeight, {
        isStatic: true,
        render: { fillStyle: '#ddd' },
        label: 'platform'
    });
    
    const levels = 1 + Math.floor(Math.random() * 2); // 1-2 additional levels
    const platforms = [mainPlatform];
    
    for (let i = 1; i <= levels; i++) {
        const levelWidth = platformWidth * 0.7;
        const levelX = x + (platformWidth - levelWidth) / 2;
        const levelY = y - (i * platformHeight * 1.2);
        
        const levelPlatform = Bodies.rectangle(
            levelX + levelWidth / 2, 
            levelY, 
            levelWidth, 
            platformHeight, 
            {
                isStatic: true,
                render: { fillStyle: '#ddd' },
                label: 'platform'
            }
        );
        
        platforms.push(levelPlatform);
        Composite.add(world, levelPlatform);
    }
    
    return mainPlatform;
}

// Create a platform with floating objects
function createFloatingObjectsPlatform(x, y) {
    const platform = Bodies.rectangle(x + platformWidth / 2, y, platformWidth, platformHeight, {
        isStatic: true,
        render: { fillStyle: '#ddd' },
        label: 'platform'
    });
    
    // Add 3-6 floating objects of different shapes
    const objectCount = 3 + Math.floor(Math.random() * 4);
    const objectTypes = ['circle', 'rectangle', 'polygon'];
    
    for (let i = 0; i < objectCount; i++) {
        const objectX = x + (platformWidth / (objectCount + 1)) * (i + 1);
        const objectY = y - platformHeight - 30 - Math.random() * 30;
        const objectType = objectTypes[Math.floor(Math.random() * objectTypes.length)];
        const color = CUBE_COLORS[Math.floor(Math.random() * CUBE_COLORS.length)];
        
        let object;
        
        switch (objectType) {
            case 'circle':
                const radius = 7 + Math.random() * 7;
                object = Bodies.circle(objectX, objectY, radius, {
                    friction: 0.05 + Math.random() * 0.1,
                    restitution: 0.3 + Math.random() * 0.4,
                    render: { fillStyle: color },
                    label: 'interactive_object'
                });
                break;
                
            case 'rectangle':
                const size = 10 + Math.random() * 10;
                object = Bodies.rectangle(objectX, objectY, size, size, {
                    friction: 0.05 + Math.random() * 0.1,
                    restitution: 0.2 + Math.random() * 0.3,
                    render: { fillStyle: color },
                    label: 'interactive_object'
                });
                break;
                
            case 'polygon':
                const sides = 3 + Math.floor(Math.random() * 4); // 3-6 sides
                const radius2 = 8 + Math.random() * 7;
                object = Bodies.polygon(objectX, objectY, sides, radius2, {
                    friction: 0.05 + Math.random() * 0.1,
                    restitution: 0.2 + Math.random() * 0.4,
                    render: { fillStyle: color },
                    label: 'interactive_object'
                });
                break;
        }
        
        // Add some initial spin
        Body.setAngularVelocity(object, (Math.random() - 0.5) * 0.1);
        
        interactiveElements.push(object);
        Composite.add(world, object);
    }
    
    return platform;
}

// Create a platform with interactive cubes
function createInteractivePlatform(x, y) {
    // Create the base platform
    const platform = Bodies.rectangle(x + platformWidth / 2, y, platformWidth, platformHeight, {
        isStatic: true,
        render: { fillStyle: '#ddd' },
        label: 'platform'
    });
    
    // Add 3-6 interactive cubes on the platform (increased from 2-3)
    const cubeCount = Math.floor(Math.random() * 4) + 3;
    const minSize = 10;
    const maxSize = 20;
    
    for (let i = 0; i < cubeCount; i++) {
        const cubeX = x + (platformWidth / (cubeCount + 1)) * (i + 1);
        const cubeY = y - platformHeight - maxSize/2;
        const cubeSize = minSize + Math.random() * (maxSize - minSize);
        
        // Random properties for variety
        const density = 0.001 + Math.random() * 0.009;
        const restitution = 0.1 + Math.random() * 0.4;
        
        // Random color from the color palette
        const color = CUBE_COLORS[Math.floor(Math.random() * CUBE_COLORS.length)];
        
        const cube = Bodies.rectangle(cubeX, cubeY, cubeSize, cubeSize, {
            friction: 0.1,
            restitution: restitution,
            density: density,
            render: { fillStyle: color },
            label: 'interactive_cube'
        });
        
        // Give some cubes an initial rotation
        if (Math.random() > 0.5) {
            Body.setAngularVelocity(cube, (Math.random() - 0.5) * 0.05);
        }
        
        interactiveElements.push(cube);
        Composite.add(world, cube);
    }
    
    return platform;
}

// Generate initial platforms
function generatePlatforms(startY, count) {
    for (let i = 0; i < count; i++) {
        const y = startY - (i * platformGap);
        const x = Math.random() * (window.innerWidth - platformWidth);
        
        // Randomly choose a platform type with adjusted probabilities
        const platformTypeRoll = Math.random();
        let platform;
        
        if (platformTypeRoll < 0.25) {
            platform = createRegularPlatform(x, y);
        } else if (platformTypeRoll < 0.35) {
            platform = createRampPlatform(x, y, true); // Left-facing ramp
        } else if (platformTypeRoll < 0.45) {
            platform = createRampPlatform(x, y, false); // Right-facing ramp
        } else if (platformTypeRoll < 0.55) {
            platform = createInteractivePlatform(x, y);
        } else if (platformTypeRoll < 0.65) {
            platform = createBouncyPlatform(x, y);
        } else if (platformTypeRoll < 0.75) {
            platform = createMovingPlatform(x, y);
        } else if (platformTypeRoll < 0.82) {
            platform = createCrumblingPlatform(x, y);
        } else if (platformTypeRoll < 0.89) {
            platform = createNarrowPlatform(x, y);
        } else if (platformTypeRoll < 0.95) {
            platform = createMultiLevelPlatform(x, y);
        } else {
            platform = createFloatingObjectsPlatform(x, y);
        }
        
        platforms.push(platform);
        Composite.add(world, platform);
    }
    highestY = startY - (count * platformGap);
}

// Ground platform
const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 5, window.innerWidth, 20, {
    isStatic: true,
    render: { fillStyle: '#ddd' },
    label: 'ground_platform' // Change label to distinguish from regular platforms
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
            // Check all platform types, including ground_platform
            const platform = bodyA.label.includes('platform') ? bodyA : 
                           (bodyB.label.includes('platform') ? bodyB : null);
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

// Clean up off-screen platforms and interactive elements
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
            particle.render.opacity -= 0.000625; // 2x slower fade out (was 0.00125)
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

    // Update moving platforms
    for (const platform of movingPlatforms) {
        const newX = platform.initialX + Math.sin(engine.timing.timestamp * 0.001 * platform.movementSpeed) * platform.movementRange/2;
        Body.setPosition(platform, {
            x: newX,
            y: platform.position.y
        });
    }
    
    // Only remove interactive elements, keep all platforms
    for (let i = interactiveElements.length - 1; i >= 0; i--) {
        if (interactiveElements[i].position.y > player.position.y + window.innerHeight * 1.5) {
            Composite.remove(world, interactiveElements[i]);
            interactiveElements.splice(i, 1);
        }
    }
    
    // Platform cleanup code removed to keep all platforms
    // Platforms will remain in the world even when off-screen
});

// Collision detection for effects
Events.on(engine, 'collisionStart', (event) => {
    const pairs = event.pairs;
    for (const pair of pairs) {
        const { bodyA, bodyB } = pair;
        
        // Check for player and platform collisions
        if ((bodyA.label === 'player' && (bodyB.label === 'platform' || bodyB.label === 'bouncy_platform' || bodyB.label === 'crumbling_platform' || bodyB.label === 'moving_platform')) || 
            ((bodyA.label === 'platform' || bodyA.label === 'bouncy_platform' || bodyA.label === 'crumbling_platform' || bodyA.label === 'moving_platform') && bodyB.label === 'player')) {
            
            const platform = bodyA.label.includes('platform') ? bodyA : bodyB;
            const isPlayerOnTop = Math.abs(player.position.y - platform.position.y) < (40 / 2 + platformHeight / 2 + 5) && player.velocity.y >= 0;
            
            // Start crumbling if it's a crumbling platform and player landed on top
            if (platform.label === 'crumbling_platform' && isPlayerOnTop && !platform.isCrumbling) {
                platform.isCrumbling = true;
                
                // Add shake effect
                const originalPos = { x: platform.position.x, y: platform.position.y };
                const shakeInterval = setInterval(() => {
                    const offsetX = (Math.random() - 0.5) * 2;
                    const offsetY = (Math.random() - 0.5) * 2;
                    Body.setPosition(platform, {
                        x: originalPos.x + offsetX,
                        y: originalPos.y + offsetY
                    });
                }, 30);
                
                // Remove platform after delay
                setTimeout(() => {
                    clearInterval(shakeInterval);
                    
                    // Create crumbling effect particles
                    const particleCount = 15;
                    for (let i = 0; i < particleCount; i++) {
                        const x = platform.position.x + (Math.random() - 0.5) * platformWidth;
                        const y = platform.position.y + (Math.random() - 0.5) * platformHeight;
                        const size = 3 + Math.random() * 5;
                        
                        const particle = Bodies.rectangle(x, y, size, size, {
                            friction: 0.05,
                            restitution: 0.1,
                            render: { fillStyle: '#ddd' },
                            label: 'effect'
                        });
                        
                        Body.setVelocity(particle, {
                            x: (Math.random() - 0.5) * 5,
                            y: Math.random() * 2
                        });
                        
                        effectParticles.push(particle);
                        Composite.add(world, particle);
                    }
                    
                    // Remove the platform
                    const index = platforms.indexOf(platform);
                    if (index > -1) {
                        platforms.splice(index, 1);
                    }
                    Composite.remove(world, platform);
                }, 500);
            }
            
            // Smash effect on hard landing
            if (player.velocity.y > 10) {
                // Set squinting face when impact is hard
                isSquinting = true;
                squintTimer = squintDuration;
                
                const particleCount = 20; // 2x less debris (was 40)
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
            
            // Bounce effect for bouncy platforms
            if (platform.label === 'bouncy_platform' && isPlayerOnTop) {
                // Extra boost for bouncy platforms
                const bounceFactor = 0.04;
                Body.setVelocity(player, {
                    x: player.velocity.x,
                    y: -Math.abs(player.velocity.y) * 1.5
                });
                
                // Bouncy platform effect particles
                for (let i = 0; i < 15; i++) {
                    const x = platform.position.x + (Math.random() - 0.5) * platformWidth;
                    const y = platform.position.y - platformHeight/2;
                    
                    const particle = Bodies.circle(x, y, 2 + Math.random() * 3, {
                        isSensor: true,
                        render: { 
                            fillStyle: 'rgba(200, 200, 255, 0.7)',
                        },
                        label: 'effect'
                    });
                    
                    Body.setVelocity(particle, {
                        x: (Math.random() - 0.5) * 3,
                        y: -Math.random() * 5 - 2
                    });
                    
                    effectParticles.push(particle);
                    Composite.add(world, particle);
                }
            }
        }
        
        // Interaction with cube elements and other interactive objects
        if ((bodyA.label === 'player' && (bodyB.label === 'interactive_cube' || bodyB.label === 'interactive_object')) || 
            ((bodyA.label === 'interactive_cube' || bodyA.label === 'interactive_object') && bodyB.label === 'player')) {
            
            const object = bodyA.label.includes('interactive') ? bodyA : bodyB;
            
            // Apply a force to the object when hit by player
            const forceDirection = Vector.normalise(
                Vector.sub(object.position, player.position)
            );
            
            // Adjust force based on velocity
            const speed = Vector.magnitude(player.velocity);
            const forceMagnitude = Vector.mult(forceDirection, 0.01 * Math.min(speed, 10));
            
            Body.applyForce(object, object.position, forceMagnitude);
            
            // Small particle effect on collision
            if (speed > 5) {
                for (let i = 0; i < 5; i++) {
                    const x = object.position.x + (Math.random() - 0.5) * 10;
                    const y = object.position.y + (Math.random() - 0.5) * 10;
                    
                    const particle = Bodies.circle(x, y, 1 + Math.random() * 2, {
                        isSensor: true,
                        render: { 
                            fillStyle: 'rgba(255, 255, 255, 0.7)'
                        },
                        label: 'effect'
                    });
                    
                    Body.setVelocity(particle, {
                        x: (Math.random() - 0.5) * 2,
                        y: (Math.random() - 0.5) * 2
                    });
                    
                    effectParticles.push(particle);
                    Composite.add(world, particle);
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
            particle.render.opacity -= 0.000625; // 2x slower fade out (was 0.00125)
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
    
    // Ensure ground follows window width changes
    Body.setPosition(ground, {x: window.innerWidth / 2, y: window.innerHeight + 5});
    Body.setVertices(ground, Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 5, window.innerWidth, 20).vertices);
});
