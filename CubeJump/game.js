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
const keys = { left: false, right: false, up: false }; // Removed boost key
let upPressedLastFrame = false; // Track up key for jump edge detection
let playerOnGround = false;
let canDoubleJump = false; // Track if player can double jump
let hasDoubleJumped = false; // Track if player has used double jump
// Add double jump cooldown variables
let doubleJumpCooldown = 0; // Cooldown timer in frames
const doubleJumpCooldownMax = 180; // 3 seconds at 60fps

// Rain system variables
const raindrops = [];
let isRaining = true; // Start with rain
let isInitialRain = true; // Track if we're in the initial rain period
let isBlockRain = Math.random() < 0.5; // 50% chance for block rain
let rainTimer = 0;
const initialRainDuration = 1800; // 30 seconds at 60fps
const rainOnDuration = 3600; // 60fps × 60 seconds = 1 minute of rain
const rainOffDuration = 5400; // 60fps × 90 seconds = 1 minute 30 seconds of dry weather
const rainIntensity = 12; // Raindrops per frame
const maxRaindrops = 400; // Maximum number of raindrops to prevent performance issues

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
const squintDuration = 120; // Increased from 60 to 120 (2x longer)

// Eye animation variables
let eyeDirection = { x: 0, y: 0 };
let targetEyeDirection = { x: 0, y: 0 };
let eyeMovementTimer = 0;
let blinkTimer = 0;
let isBlinking = false;

// Music variables
const music1 = document.getElementById('music1');
const music2 = document.getElementById('music2');
let currentMusic = music1;
let musicInitialized = false;

// Add missing score and high score elements and highestY
const scoreElement = document.getElementById('score');
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
const highScoreElement = document.getElementById('high-score');
highScoreElement.innerText = `High Score: ${highScore}`;
let highestY = window.innerHeight;

// Utility to get a random color - Add this function back in
function getRandomColor() {
    // Generate a random hex color
    return '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
}

// Initialize and play background music
function initMusic() {
    if (!musicInitialized) {
        // Set up volume
        music1.volume = 0.5;
        music2.volume = 0.5;
        
        // Start with the first song
        playCurrentMusic();
        
        // Add event listeners to handle song transitions
        music1.addEventListener('ended', switchToNextSong);
        music2.addEventListener('ended', switchToNextSong);
        
        musicInitialized = true;
    }
}

// Play the current music track
function playCurrentMusic() {
    currentMusic.play().catch(err => {
        console.log("Music play failed, will retry on user interaction:", err);
    });
}

// Switch to the next song when one ends
function switchToNextSong() {
    currentMusic.pause();
    currentMusic.currentTime = 0;
    
    // Toggle between the two songs
    currentMusic = (currentMusic === music1) ? music2 : music1;
    
    playCurrentMusic();
}

// Handle user interaction to start music (browsers require user interaction)
window.addEventListener('click', () => {
    initMusic();
});

window.addEventListener('keydown', () => {
    initMusic();
});

// Custom render function for player with face
function renderPlayer(body, ctx) {
    const width = 40;
    const height = 40;
    
    // Draw cube body
    ctx.fillStyle = body.render.fillStyle;
    ctx.beginPath();
    ctx.rect(-(width / 2), -(height / 2), width, height);
    ctx.fill();
    
    // Draw face features
    drawFace(ctx, width, height);
}

// Function to draw the face features
function drawFace(ctx, width, height) {
    // Face variables
    const eyeSize = 8;
    const pupilSize = 4;
    const mouthWidth = 14;
    const mouthHeight = isSquinting ? 2 : 6;

    // Draw eyes
    // Left eye socket
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-10, -5, eyeSize, 0, Math.PI * 2);
    ctx.fill();

    // Right eye socket
    ctx.beginPath();
    ctx.arc(10, -5, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    
    if (isSquinting) {
        // Squinting eyes
        ctx.fillStyle = '#000';
        // Squinting left eye (line)
        ctx.beginPath();
        ctx.rect(-15, -5, 10, 2);
        ctx.fill();
        
        // Squinting right eye (line)
        ctx.beginPath();
        ctx.rect(5, -5, 10, 2);
        ctx.fill();
    } else if (isBlinking) {
        // Blinking eyes (mostly closed)
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.rect(-14, -5, 8, 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.rect(6, -5, 8, 2);
        ctx.fill();
    } else {
        // Draw pupils - they move based on eye direction
        ctx.fillStyle = '#000';
        // Left pupil
        ctx.beginPath();
        ctx.arc(-10 + eyeDirection.x * 3, -5 + eyeDirection.y * 2, pupilSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Right pupil
        ctx.beginPath();
        ctx.arc(10 + eyeDirection.x * 3, -5 + eyeDirection.y * 2, pupilSize, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Draw mouth
    ctx.fillStyle = '#000';
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

// Add missing platform constants
const platformWidth = 120;
const platformHeight = 20;
const platformGap = 180;

// Create a regular platform
function createRegularPlatform(x, y) {
    const platform = Bodies.rectangle(x + platformWidth / 2, y, platformWidth, platformHeight, {
        isStatic: true,
        render: { fillStyle: '#ddd' }, // Always visible
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
        render: { fillStyle: '#ddd' }, // Always visible
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
        render: { 
            fillStyle: '#e5c07b',  // Changed to a more visible sandy color
            lineWidth: 2,
            strokeStyle: '#c0a060'  // Add border for visibility
        },
        label: 'crumbling_platform',
        isCrumbling: false,
        crumbleTimer: 30 // Frames before platform disappears after landing
    });
    
    // Add crack pattern directly instead of using a canvas texture
    // This ensures the cracks are clearly visible
    platform.render.sprite = null; // Remove sprite to use direct color
    
    return platform;
}

// Create a narrow platform
function createNarrowPlatform(x, y) {
    const narrowWidth = platformWidth / 2;
    const platform = Bodies.rectangle(x + narrowWidth / 2, y, narrowWidth, platformHeight, {
        isStatic: true,
        render: { fillStyle: '#ddd' }, // Always visible
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
        
        if (platformTypeRoll < 0.20) {
            platform = createRegularPlatform(x, y);
        } else if (platformTypeRoll < 0.28) {
            platform = createRampPlatform(x, y, true); // Left-facing ramp
        } else if (platformTypeRoll < 0.36) {
            platform = createRampPlatform(x, y, false); // Right-facing ramp
        } else if (platformTypeRoll < 0.46) {
            platform = createInteractivePlatform(x, y);
        } else if (platformTypeRoll < 0.56) {
            platform = createBouncyPlatform(x, y);
        } else if (platformTypeRoll < 0.66) {
            platform = createMovingPlatform(x, y);
        } else if (platformTypeRoll < 0.86) {  // Increased probability: now 20% (0.66 to 0.86)
            platform = createCrumblingPlatform(x, y);
        } else if (platformTypeRoll < 0.91) {
            platform = createNarrowPlatform(x, y);
        } else if (platformTypeRoll < 0.96) {
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
    // Removed boost control
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') keys.left = false;
    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') keys.right = false;
    if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') keys.up = false;
    // Removed boost control
});

// Collision detection for ground status
function checkGround(pairs) {
    for (const pair of pairs) {
        const { bodyA, bodyB } = pair;
        if (bodyA.label === 'player' || bodyB.label === 'player') {
            // Check all platform types, including ground_platform
            const platform = bodyA.label.includes('platform') ? bodyA : 
                           (bodyB.label.includes('platform') ? bodyB : null);
                           
            // Check for interactive objects and debris
            const interactiveObj = bodyA.label === 'interactive_cube' || bodyA.label === 'interactive_object' ? bodyA : 
                                 (bodyB.label === 'interactive_cube' || bodyB.label === 'interactive_object' ? bodyB : null);
            
            // Check for effect particles (debris)
            const debris = bodyA.label === 'effect' ? bodyA : 
                         (bodyB.label === 'effect' ? bodyB : null);
            
            if (platform) {
                // Check if player is on top of the platform
                if (Math.abs(player.position.y - platform.position.y) < (40 / 2 + platformHeight / 2 + 5) && player.velocity.y >= 0) {
                    return true;
                }
            } else if (interactiveObj) {
                // Check if player is on top of interactive object
                if (Math.abs(player.position.y - interactiveObj.position.y) < (40 / 2 + interactiveObj.circleRadius || 10) && player.velocity.y >= 0) {
                    return true;
                }
            } else if (debris) {
                // Check if player is on top of debris
                if (Math.abs(player.position.y - debris.position.y) < (40 / 2 + 5) && player.velocity.y >= 0) {
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

    // Reset double jump when player is on ground
    if (playerOnGround) {
        canDoubleJump = true;
        hasDoubleJumped = false;
    }
    
    // Update double jump cooldown
    if (doubleJumpCooldown > 0) {
        doubleJumpCooldown--;
    }
    
    // Update rain system
    updateRain();
    
    // Player movement
    const velocity = player.velocity;
    let newVelocityX = 0;
    if (keys.left) newVelocityX = -5;
    if (keys.right) newVelocityX = 5;
    
    // Apply terminal velocity to prevent clipping through floor
    if (velocity.y > 15) {
        velocity.y = 15; // Limit maximum falling speed
    }
    
    Body.setVelocity(player, { x: newVelocityX, y: velocity.y });

    // Jump mechanics - First jump on ground, double jump in air
    if (keys.up && !upPressedLastFrame) {
        // First jump (on ground)
        if (playerOnGround) {
            Body.applyForce(player, player.position, { x: 0, y: -1.1 * 0.4 * 1.2 });
        }
        // Double jump (in air)
        else if (canDoubleJump && !hasDoubleJumped && doubleJumpCooldown <= 0) {
            Body.setVelocity(player, { x: player.velocity.x, y: 0 }); // Reset vertical velocity
            Body.applyForce(player, player.position, { x: 0, y: -1.1 * 0.4 * 1.2 });
            hasDoubleJumped = true;
            canDoubleJump = false;
            
            // Set cooldown
            doubleJumpCooldown = doubleJumpCooldownMax;
            // Removed flash effect code
            
            // Double jump effect particles
            for (let i = 0; i < 10; i++) {
                const x = player.position.x + (Math.random() - 0.5) * 40;
                const y = player.position.y + 20;
                const jumpParticle = Bodies.circle(x, y, 2 + Math.random() * 3, {
                    isSensor: true,
                    render: { fillStyle: 'rgba(255, 255, 255, 0.7)' },
                    label: 'effect'
                });
                Body.setVelocity(jumpParticle, { 
                    x: (Math.random() - 0.5) * 3, 
                    y: Math.random() * 2 + 2 
                });
                effectParticles.push(jumpParticle);
                Composite.add(world, jumpParticle);
            }
        }
        // Removed cooldown flash feedback
    }
    upPressedLastFrame = keys.up;

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
    
    // Idle animation - eye movement and blinking
    // Handle eye movement for looking around
    eyeMovementTimer--;
    if (eyeMovementTimer <= 0) {
        // Set new target direction for eyes to look
        targetEyeDirection = {
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2
        };
        // Set timer for next eye movement (between 1-4 seconds)
        eyeMovementTimer = 60 * (1 + Math.random() * 3);
    }
    
    // Smoothly move eyes toward target direction
    eyeDirection.x += (targetEyeDirection.x - eyeDirection.x) * 0.1;
    eyeDirection.y += (targetEyeDirection.y - eyeDirection.y) * 0.1;
    
    // Handle random blinking
    blinkTimer--;
    if (blinkTimer <= 0 && !isBlinking) {
        isBlinking = true;
        blinkTimer = 5; // Blink duration in frames
    } else if (isBlinking && blinkTimer <= 0) {
        isBlinking = false;
        blinkTimer = 60 * (2 + Math.random() * 5); // 2-7 seconds between blinks
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
        
        // Check for raindrop or block rain collisions
        if (bodyA.label === 'raindrop' || bodyA.label === 'blockrain' || 
            bodyB.label === 'raindrop' || bodyB.label === 'blockrain') {
            
            const raindrop = bodyA.label === 'raindrop' || bodyA.label === 'blockrain' ? bodyA : bodyB;
            const other = bodyA === raindrop ? bodyB : bodyA;
            
            // Create splash effect when raindrop hits platform or player
            if (other.label.includes('platform') || other.label === 'player') {
                // Different effects for different rain types
                if (raindrop.label === 'raindrop') {
                    createSplash(raindrop.position);
                } else {
                    // Block rain creates different impact effects
                    createBlockImpact(raindrop.position, raindrop.render.fillStyle);
                }
                
                // Remove the raindrop after collision
                const index = raindrops.indexOf(raindrop);
                if (index > -1) {
                    Composite.remove(world, raindrop);
                    raindrops.splice(index, 1);
                }
            }
        }
        
        // Check for player and platform collisions
        if ((bodyA.label === 'player' && (bodyB.label === 'platform' || bodyB.label === 'bouncy_platform' || bodyB.label === 'crumbling_platform' || bodyB.label === 'moving_platform')) || 
            ((bodyA.label === 'platform' || bodyA.label === 'bouncy_platform' || bodyA.label === 'crumbling_platform' || bodyA.label === 'moving_platform') && bodyB.label === 'player')) {
            
            const platform = bodyA.label.includes('platform') ? bodyA : bodyB;
            const isPlayerOnTop = Math.abs(player.position.y - platform.position.y) < (40 / 2 + platformHeight / 2 + 5) && player.velocity.y >= 0;
            
            // Start crumbling if it's a crumbling platform and player landed on top
            if (platform.label === 'crumbling_platform' && isPlayerOnTop && !platform.isCrumbling) {
                platform.isCrumbling = true;
                
                // Change color to indicate crumbling
                platform.render.fillStyle = '#ff9966';
                platform.render.strokeStyle = '#cc6633';
                
                // Add shake effect
                const originalPos = { x: platform.position.x, y: platform.position.y };
                const shakeInterval = setInterval(() => {
                    const offsetX = (Math.random() - 0.5) * 3; // Increased shake
                    const offsetY = (Math.random() - 0.5) * 3;
                    Body.setPosition(platform, {
                        x: originalPos.x + offsetX,
                        y: originalPos.y + offsetY
                    });
                }, 30);
                
                // Remove platform after delay
                setTimeout(() => {
                    clearInterval(shakeInterval);
                    
                    // Create crumbling effect particles
                    const particleCount = 20; // More particles for visibility
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
                Body.setVelocity(player, {
                    x: player.velocity.x,
                    y: -Math.abs(player.velocity.y) * 1.5
                });
                
                // Removed bouncy platform effect particles as requested
                // No debris will be created for jump pads
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

// Create a raindrop
function createRaindrop() {
    const x = Math.random() * (window.innerWidth + 400) - 200; // Wider area than screen
    const y = player.position.y - window.innerHeight / 2 - Math.random() * 100; // Start above screen
    
    const raindrop = Bodies.rectangle(x, y, 2, 10, {
        friction: 0.01,
        restitution: 0.3,
        frictionAir: 0.01,
        angle: Math.PI / 10 * (Math.random() - 0.5), // Slight angle variation
        render: { 
            fillStyle: 'rgba(120, 150, 255, 0.7)'
        },
        label: 'raindrop',
        collisionFilter: {
            group: 0,
            category: 0x0010,
            mask: 0x0001 // Only collide with default category (platforms and player)
        }
    });
    
    // Add initial velocity
    Body.setVelocity(raindrop, { x: Math.random() - 0.5, y: 5 + Math.random() * 3 });
    
    raindrops.push(raindrop);
    Composite.add(world, raindrop);
    
    return raindrop;
}

// Create a block rain element
function createBlockRain() {
    const x = Math.random() * (window.innerWidth + 400) - 200; // Wider area than screen
    const y = player.position.y - window.innerHeight / 2 - Math.random() * 100; // Start above screen
    
    const size = 4 + Math.random() * 8; // Random small block sizes
    const blockRain = Bodies.rectangle(x, y, size, size, {
        friction: 0.01,
        restitution: 0.3,
        frictionAir: 0.01,
        angle: Math.PI * Math.random() * 2, // Random rotation
        render: { 
            fillStyle: `rgba(${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(Math.random() * 155 + 100)}, 0.7)`
        },
        label: 'blockrain',
        collisionFilter: {
            group: 0,
            category: 0x0010,
            mask: 0x0001 // Only collide with default category (platforms and player)
        }
    });
    
    // Add initial velocity
    Body.setVelocity(blockRain, { x: Math.random() - 0.5, y: 4 + Math.random() * 2 });
    // Add some spin
    Body.setAngularVelocity(blockRain, (Math.random() - 0.5) * 0.1);
    
    raindrops.push(blockRain);
    Composite.add(world, blockRain);
    
    return blockRain;
}

// Create splash effect when raindrop hits something
function createSplash(position) {
    for (let i = 0; i < 3; i++) { // Create 3 splash particles
        const splashParticle = Bodies.circle(
            position.x + (Math.random() - 0.5) * 5,
            position.y,
            1 + Math.random(),
            {
                isSensor: true,
                render: { fillStyle: 'rgba(120, 150, 255, 0.6)' },
                label: 'effect'
            }
        );
        
        // Give particles upward velocity
        Body.setVelocity(splashParticle, {
            x: (Math.random() - 0.5) * 2,
            y: -Math.random() * 2
        });
        
        effectParticles.push(splashParticle);
        Composite.add(world, splashParticle);
    }
}

// Create impact effect when block rain hits something
function createBlockImpact(position, color) {
    for (let i = 0; i < 5; i++) { // Create 5 block fragments
        const fragment = Bodies.rectangle(
            position.x + (Math.random() - 0.5) * 8,
            position.y + (Math.random() - 0.5) * 8,
            1 + Math.random() * 3,
            1 + Math.random() * 3,
            {
                isSensor: true,
                render: { fillStyle: color },
                label: 'effect'
            }
        );
        
        // Give fragments scattered velocity
        Body.setVelocity(fragment, {
            x: (Math.random() - 0.5) * 3,
            y: (Math.random() - 0.5) * 3
        });
        
        // Add some spin
        Body.setAngularVelocity(fragment, (Math.random() - 0.5) * 0.2);
        
        effectParticles.push(fragment);
        Composite.add(world, fragment);
    }
}

// Remove all raindrops from the world
function clearRaindrops() {
    for (let i = raindrops.length - 1; i >= 0; i--) {
        Composite.remove(world, raindrops[i]);
    }
    raindrops.length = 0;
}

// Update rain system
function updateRain() {
    // Update rain timer
    rainTimer++;
    
    // Handle initial rain period
    if (isInitialRain) {
        if (rainTimer >= initialRainDuration) {
            rainTimer = 0;
            isRaining = false;
            isInitialRain = false; // End initial rain period
            clearRaindrops(); // Remove all raindrops when rain stops
        }
    } else {
        // Normal cycle after initial period
        if (isRaining && rainTimer >= rainOnDuration) {
            rainTimer = 0;
            isRaining = false;
            clearRaindrops(); // Remove all raindrops when rain stops
        } else if (!isRaining && rainTimer >= rainOffDuration) {
            rainTimer = 0;
            isRaining = true;
            // 50% chance for block rain each time it starts raining
            isBlockRain = Math.random() < 0.5;
        }
    }
    
    // Generate new raindrops if raining
    if (isRaining && raindrops.length < maxRaindrops) {
        for (let i = 0; i < rainIntensity; i++) {
            if (isBlockRain) {
                createBlockRain();
            } else {
                createRaindrop();
            }
        }
    }
    
    // Remove raindrops that are too far down
    for (let i = raindrops.length - 1; i >= 0; i--) {
        const raindrop = raindrops[i];
        if (raindrop.position.y > player.position.y + window.innerHeight) {
            Composite.remove(world, raindrop);
            raindrops.splice(i, 1);
        }
    }
}

// Override the default render
// Add this after your existing render setup
Events.on(render, 'afterRender', function() {
    const bodies = Composite.allBodies(world);
    const context = render.context;
    
    context.save();
    
    // Adjust the context for camera position
    
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
    
    // Removed cooldown indicator rendering
    
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

// Additional check to reset double jump when touching any object
Events.on(engine, 'collisionActive', (event) => {
    const pairs = event.pairs;
    for (const pair of pairs) {
        const { bodyA, bodyB } = pair;
        
        // If player collides with any interactive object or debris from below or sides
        if ((bodyA.label === 'player' && (bodyB.label === 'interactive_cube' || bodyB.label === 'interactive_object' || bodyB.label === 'effect')) ||
            ((bodyA.label === 'interactive_cube' || bodyA.label === 'interactive_object' || bodyA.label === 'effect') && bodyB.label === 'player')) {
            
            const obj = bodyA.label === 'player' ? bodyB : bodyA;
            
            // If player is on top of the object
            if (player.position.y < obj.position.y) {
                // Only reset double jump if cooldown has expired
                if (doubleJumpCooldown <= 0) {
                    canDoubleJump = true;
                    hasDoubleJumped = false;
                }
            }
        }
    }
});
