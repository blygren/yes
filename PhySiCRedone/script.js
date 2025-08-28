// Module aliases
const { Engine, Render, Runner, World, Bodies, Composite, Events, Body, Mouse, MouseConstraint } = Matter;

// Create an engine
const engine = Engine.create();
const world = engine.world;

// Play time tracking variables
let totalPlayTimeSeconds = 0;
let lastSaveTime = Date.now();
let playTimeInterval;
const SAVE_INTERVAL = 30000; // Save every 30 seconds

// Statistics tracking variables
let stats = {
    totalSpawned: 0,
    circlesSpawned: 0,
    polygonsSpawned: 0,
    rectanglesSpawned: 0,
    explosionsTriggered: 0,
    objectsDeleted: 0,
    weldsCreated: 0,
    namesGiven: 0,
    facesCreated: 0,
    objectsCleared: 0
};

// Create a renderer
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false, // Set to false for solid colors
        background: 'transparent'
    }
});

Render.run(render);

// Create runner
const runner = Runner.create();
Runner.run(runner, engine);

// Add boundaries - keep reference to add to world later
let boundaries = [];

// Create boundaries with proper dimensions
function createBoundaries() {
    // Remove old boundaries if they exist
    if (boundaries.length > 0) {
        Composite.remove(world, boundaries);
        boundaries = [];
    }

    // Add some extra width/height to boundaries to ensure no gaps
    const extraSize = 100;
    
    // Create new boundaries with updated dimensions
    const ground = Bodies.rectangle(
        window.innerWidth / 2, 
        window.innerHeight + 25, 
        window.innerWidth + extraSize, // Extra width to cover corners
        50, 
        { isStatic: true }
    );
    
    const leftWall = Bodies.rectangle(
        -25, 
        window.innerHeight / 2, 
        50, 
        window.innerHeight + extraSize, // Extra height to cover corners
        { isStatic: true }
    );
    
    const rightWall = Bodies.rectangle(
        window.innerWidth + 25, 
        window.innerHeight / 2, 
        50, 
        window.innerHeight + extraSize, // Extra height to cover corners
        { isStatic: true }
    );
    
    const ceiling = Bodies.rectangle(
        window.innerWidth / 2, 
        -25, 
        window.innerWidth + extraSize, // Extra width to cover corners
        50, 
        { isStatic: true }
    );
    
    boundaries = [ground, leftWall, rightWall, ceiling];
    
    // Add the new boundaries to the world
    Composite.add(world, boundaries);
    
    return boundaries;
}

// Create initial boundaries
boundaries = createBoundaries();

// Ball spawning logic
let isMouseDown = false;
let ballRadius = 20;
let randomSizesEnabled = false;
let randomColorsEnabled = false;
const minBallRadius = 10;
const maxBallRadius = 30;
let ballColors = ['#C44569', '#D6A2E8', '#786FA6', '#596275', '#2C3A47'];
let ballBounciness = 0.7;
let objectFriction = 0.1;
let objectStaticFriction = 0.5;
let randomRotationEnabled = false;
let isStaticEnabled = false;
let initialRotationSpeed = 0;
let lifespanEnabled = false;
let facesEnabled = false;
let invincibleFacesEnabled = false;
let objectLifespan = 5000; // in ms
let selectedShape = { type: 'circle' };
let objectDensity = 0.001;
let spawnInterval;
let spawnSpeed = 20; // Balls per second
let customTemplates = {};
let objectCollisionsEnabled = true;
let attractionStrength = 5;
let attractionRadius = 200;
let explosionStrength = 0.05;
let explosionRadius = 150;
let shockwaves = [];
let isPaused = false; // Add pause state tracking
let invisibleWeldsEnabled = false;
let namesEnabled = false;
let manualNameEnabled = false; // New variable for manual naming
let customName = ""; // New variable to store custom name

// Reference data from the external data file
const namePool = NAME_POOL;
const shapes = SHAPES;
const templates = COLOR_TEMPLATES;
const friendsOfPhysicTemplates = FRIENDS_TEMPLATES;

// Background settings
let gridEnabled = true;
let gridColor = '#0000FF';
let backgroundColor = '#1a1a1a';

const colorSettingsContainer = document.getElementById('color-settings-container');
const templatesLibrary = document.getElementById('templates-library');
const templatesContainer = document.getElementById('templates-container');
const shapesLibrary = document.getElementById('shapes-library');
const shapesContainer = document.getElementById('shapes-container');

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function updateBackground() {
    document.body.style.backgroundColor = backgroundColor;
    if (gridEnabled) {
        const gridRgba = hexToRgba(gridColor, 0.5);
        document.body.style.backgroundImage = `
            linear-gradient(${gridRgba} 1px, transparent 1px),
            linear-gradient(90deg, ${gridRgba} 1px, transparent 1px)
        `;
        document.body.style.backgroundSize = '40px 40px';
    } else {
        document.body.style.backgroundImage = 'none';
    }
}

function renderColorPickers() {
    colorSettingsContainer.innerHTML = ''; // Clear existing pickers
    ballColors.forEach((color, index) => {
        const settingDiv = document.createElement('div');
        settingDiv.className = 'setting';

        const label = document.createElement('label');
        label.htmlFor = `color${index + 1}`;
        label.textContent = `Color ${index + 1}`;

        const input = document.createElement('input');
        input.type = 'color';
        input.id = `color${index + 1}`;
        input.value = color;
        input.addEventListener('input', () => {
            ballColors[index] = input.value;
        });

        settingDiv.appendChild(label);
        settingDiv.appendChild(input);
        colorSettingsContainer.appendChild(settingDiv);
    });
}

function addColor() {
    // Add a new random color
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    ballColors.push(randomColor);
    renderColorPickers();
}

function removeColor() {
    if (ballColors.length > 1) { // Keep at least one color
        ballColors.pop();
        renderColorPickers();
    }
}

function getCustomTemplates() {
    const stored = localStorage.getItem('customColorTemplates');
    return stored ? JSON.parse(stored) : {};
}

function saveCustomTemplates() {
    localStorage.setItem('customColorTemplates', JSON.stringify(customTemplates));
}

function saveCustomTemplate() {
    const nameInput = document.getElementById('new-template-name');
    const name = nameInput.value.trim();
    if (!name) {
        alert('Please enter a template name.');
        return;
    }
    if (templates[name] || customTemplates[name]) {
        if (!confirm(`A template named "${name}" already exists. Overwrite it?`)) {
            return;
        }
    }

    customTemplates[name] = [...ballColors];
    saveCustomTemplates();
    populateTemplatesLibrary();
    nameInput.value = '';
    alert(`Template "${name}" saved!`);
}

function deleteCustomTemplate(name) {
    if (customTemplates[name]) {
        delete customTemplates[name];
        saveCustomTemplates();
        populateTemplatesLibrary();
    }
}

function populateTemplatesLibrary() {
    templatesContainer.innerHTML = '';
    
    // Define categories and their templates with expanded categorization
    const categories = {
        "Minerals & Metals": ["Ruby Red", "Sapphire Blue", "Emerald City", "Gold Rush", "Silver Lining", "Bronze Age", "Amethyst", "Jade", "Rose Gold", "Copper Patina", "Gemstone", "Bismuth Crystal"],
        
        "Liquids & Fluids": ["Tidal", "Toxic Waste", "Ocean Depths", "Deep Sea", "Ocean Breeze", "Electric Eel", "Glacier", "Waterfall", "Ocean", "Rainy Day"],
        
        "Nature & Landscapes": ["Forest", "Meadow", "Jungle", "Deep Forest", "Lavender Fields", "Enchanted Forest", "Canyon", "Desert", "Sahara", "Tuscany", "Misty Mountains", "Frozen Tundra", "Arctic", "Coral Reef", "Tropical Rainforest", "Northern Tundra", "Savanna Sunset"],
        
        "Seasons & Weather": ["Winter", "Spring", "Summer", "Autumn", "Autumn Leaves", "Rainy Day", "Sunset", "Sunrise", "Golden Hour", "Desert Sunset", "Festive", "Stormy Sky", "Foggy Morning", "Heat Wave"],
        
        "Sky & Space": ["Deep Space", "Galaxy", "Cosmic Dust", "Cosmic Latte", "Nebula", "Twilight", "Cotton Candy Sky", "Nightshade", "Midnight City", "Interstellar", "Supernova", "Aurora Borealis", "Space Nebula", "Starlight"],
        
        "Time of Day": ["Sunrise", "Sunset", "Golden Hour", "City at Night", "Midnight City", "Twilight"],
        
        "Colors & Effects": ["Rainbow", "Pastel", "Monochrome", "Neon Glow", "Muted Tones", "Rainbow Sherbet", "Glitch", "Matrix", "Holographic", "Vaporwave", "Northern Lights", "Blacklight Glow", "Digital Dream"],
        
        "Fantasy & Magic": ["Fairy Tale", "Enchanted Forest", "Dragon Fire", "Vampire", "Poison Ivy", "Nightshade", "Wisteria", "Wizard's Potion", "Dragon's Hoard", "Celestial"],
        
        "Food & Drink": ["Candy", "Mint Chocolate", "Lollipop", "Coffee Shop", "Ice Cream", "Strawberry Lemonade", "Cherry Pie", "Bubblegum", "Pumpkin Spice", "Honey", "Cotton Candy", "Strawberry Fields", "Berry Smoothie", "Citrus Grove", "Dark Chocolate"],
        
        "Materials & Textures": ["Velvet", "Clay", "Paper & Ink", "Slate", "Silver Lining", "Golden Sands", "Bronze Age"],
        
        "Themes & Styles": ["Cyberpunk", "Retro Diner", "Vintage", "Industrial", "Steampunk", "Synthwave", "Hacker", "Gothic", "Nordic", "80s Pop", "Royal", "Matcha", "Earthy", "Brutalist", "Bauhaus", "Art Deco"],
        
        "Plants & Gardens": ["Lavender Fields", "Cherry Blossom", "Sakura Season", "Wisteria", "Poison Ivy", "Orchid", "Peppermint", "Moss"],
        
        "Fire & Heat": ["Volcano", "Dragon Fire", "Volcanic", "Fire and Ice", "Phoenix", "Lava Flow", "Ember"],
        
        "Places & Locations": ["Beach Day", "City at Night", "Misty Mountains", "Canyon", "Desert", "Tuscany", "Coral Reef", "Coffee Shop", "Retro Diner", "Sahara", "Tokyo Nights", "Ancient Ruins", "Underwater Cave"]
    };
    
    // Combine custom templates with predefined ones
    const allTemplates = { ...customTemplates, ...templates };
    
    // Create a set of all categorized templates
    const categorizedTemplates = new Set();
    for (const category in categories) {
        for (const templateName of categories[category]) {
            categorizedTemplates.add(templateName);
        }
    }
    
    // Add templates that aren't in any category to "Misc"
    categories["Misc"] = [];
    for (const name in allTemplates) {
        if (!categorizedTemplates.has(name) && !customTemplates.hasOwnProperty(name)) {
            categories["Misc"].push(name);
        }
    }
    
    // Display custom templates first with their own heading
    if (Object.keys(customTemplates).length > 0) {
        const customHeader = document.createElement('h3');
        customHeader.textContent = "My Templates";
        customHeader.className = "template-category-header";
        templatesContainer.appendChild(customHeader);
        
        for (const name in customTemplates) {
            const template = customTemplates[name];
            createTemplateItem(name, template, true);
        }
    }
    
    // Display templates by category
    for (const category in categories) {
        if (categories[category].length === 0) continue; // Skip empty categories
        
        const categoryHeader = document.createElement('h3');
        categoryHeader.textContent = category;
        categoryHeader.className = "template-category-header";
        templatesContainer.appendChild(categoryHeader);
        
        // Display templates in this category
        for (const templateName of categories[category].sort()) {
            if (templates[templateName]) {
                createTemplateItem(templateName, templates[templateName], false);
            }
        }
    }
    
    // Add Friends of PhySiC section
    const friendsHeader = document.createElement('h3');
    friendsHeader.textContent = "Friends of PhySiC";
    friendsHeader.className = "template-category-header";
    templatesContainer.appendChild(friendsHeader);

    for (const name in friendsOfPhysicTemplates) {
        const template = friendsOfPhysicTemplates[name];
        createTemplateItem(name, template, false);
    }
    
    // Helper function to create template items
    function createTemplateItem(name, template, isCustom) {
        const item = document.createElement('div');
        item.className = 'template-item';

        let swatchesHTML = template.map(color => `<div class="swatch" style="background-color: ${color};"></div>`).join('');

        const headerHTML = isCustom ? `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h4 style="margin: 0;">${name}</h4>
                <button class="delete-template-btn" data-name="${name}">&times;</button>
            </div>
        ` : `<h4 style="margin-bottom: 10px;">${name}</h4>`;

        item.innerHTML = `
            ${headerHTML}
            <div class="color-swatches">${swatchesHTML}</div>
            <button class="apply-template-btn">Apply</button>
        `;

        item.querySelector('.apply-template-btn').addEventListener('click', () => {
            ballColors = [...template];
            renderColorPickers();
            templatesLibrary.classList.add('hidden');
        });

        if (isCustom) {
            item.querySelector('.delete-template-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                const templateName = e.target.getAttribute('data-name');
                if (confirm(`Are you sure you want to delete the "${templateName}" template?`)) {
                    deleteCustomTemplate(templateName);
                }
            });
        }

        templatesContainer.appendChild(item);
    }
}

function populateShapesLibrary() {
    shapesContainer.innerHTML = '';
    for (const name in shapes) {
        const shape = shapes[name];
        const item = document.createElement('div');
        item.className = 'shape-item';
        item.innerHTML = `
            <svg viewBox="0 0 50 50">${shape.svg}</svg>
            <h4>${name}</h4>
        `;
        item.addEventListener('click', () => {
            selectedShape = shape;
            shapesLibrary.classList.add('hidden');
        });
        shapesContainer.appendChild(item);
    }
}

function saveState() {
    const state = {
        settings: {
            ballRadius,
            randomSizesEnabled,
            ballColors: [...ballColors],
            ballBounciness,
            objectFriction,
            objectStaticFriction,
            randomRotationEnabled,
            isStaticEnabled,
            initialRotationSpeed,
            lifespanEnabled,
            facesEnabled,
            invincibleFacesEnabled,
            objectLifespan,
            selectedShape,
            objectDensity,
            spawnSpeed,
            objectCollisionsEnabled,
            attractionStrength,
            attractionRadius,
            explosionStrength,
            explosionRadius,
            gridEnabled,
            gridColor,
            backgroundColor,
            namesEnabled,
            manualNameEnabled, // Add the new setting
            customName, // Add the custom name to the saved state
            engine: {
                gravity: { ...engine.world.gravity },
                airFriction: engine.airFriction,
                timing: { timeScale: engine.timing.timeScale }
            },
            world: {
                wallBounciness: boundaries[0].restitution
            }
        },
        objects: [],
        constraints: [] // New array to store weld constraints
    };

    const allBodies = Composite.allBodies(world);
    state.objects = allBodies
        .filter(body => !boundaries.includes(body))
        .map(body => {
            return {
                label: body.label,
                position: { ...body.position },
                velocity: { ...body.velocity },
                angle: body.angle,
                angularVelocity: body.angularVelocity,
                isStatic: body.isStatic,
                restitution: body.restitution,
                friction: body.friction,
                frictionStatic: body.frictionStatic,
                density: body.density,
                render: {
                    fillStyle: body.render.fillStyle
                },
                hasFace: body.hasFace,
                blinkTimer: body.blinkTimer,
                isBlinking: body.isBlinking,
                blinkDuration: body.blinkDuration,
                damage: body.damage,
                isDead: body.isDead,
                isBeingDragged: body.isBeingDragged,
                emotionTimer: body.emotionTimer,
                lookAtTarget: body.lookAtTarget ? body.lookAtTarget.id : null,
                lookTimer: body.lookTimer,
                isLooking: body.isLooking,
                lookDuration: body.lookDuration,
                isSad: body.isSad || false,
                sadTimer: body.sadTimer || 0,
                collisionFilter: { ...body.collisionFilter },
                vertices: body.vertices.map(v => ({ x: v.x, y: v.y })),
                id: body.id, // Save the body ID for constraint references
                customName: body.customName,
                isRainbowName: body.isRainbowName,
                isGlitchName: body.isGlitchName // removed isGoldName / isShadowName
            };
        });
        
    // Save all weld constraints
    state.constraints = weldingConstraints.map(constraint => {
        return {
            bodyAId: constraint.bodyA.id,
            bodyBId: constraint.bodyB.id,
            length: constraint.length,
            stiffness: constraint.stiffness,
            render: {
                visible: constraint.render.visible,
                strokeStyle: constraint.render.strokeStyle,
                lineWidth: constraint.render.lineWidth
            }
        };
    });

    const stateString = JSON.stringify(state, null, 2);
    const blob = new Blob([stateString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `physics-sim-state-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function loadState(state) {
    clearBalls();

    // Restore settings
    const s = state.settings;
    ballRadius = s.ballRadius;
    randomSizesEnabled = s.randomSizesEnabled;
    ballColors = [...s.ballColors];
    ballBounciness = s.ballBounciness;
    objectFriction = s.objectFriction;
    objectStaticFriction = s.objectStaticFriction;
    randomRotationEnabled = s.randomRotationEnabled;
    isStaticEnabled = s.isStaticEnabled;
    initialRotationSpeed = s.initialRotationSpeed;
    lifespanEnabled = s.lifespanEnabled;
    facesEnabled = s.facesEnabled;
    invincibleFacesEnabled = s.invincibleFacesEnabled || false; // Add with backward compatibility
    objectLifespan = s.objectLifespan;
    selectedShape = s.selectedShape;
    objectDensity = s.objectDensity;
    spawnSpeed = s.spawnSpeed;
    objectCollisionsEnabled = s.objectCollisionsEnabled;
    attractionStrength = s.attractionStrength;
    attractionRadius = s.attractionRadius;
    explosionStrength = s.explosionStrength;
    explosionRadius = s.explosionRadius;
    gridEnabled = s.gridEnabled;
    gridColor = s.gridColor;
    backgroundColor = s.backgroundColor;
    namesEnabled = s.namesEnabled || false;
    manualNameEnabled = s.manualNameEnabled || false; // Restore manual naming state
    customName = s.customName || ""; // Restore custom name

    engine.world.gravity = { ...s.engine.gravity };
    engine.airFriction = s.engine.airFriction;
    engine.timing.timeScale = s.engine.timing.timeScale;
    boundaries.forEach(wall => wall.restitution = s.world.wallBounciness);

    // Restore objects with their IDs
    const bodiesMap = {}; // Map to store bodies by their original ID
    const newBodies = state.objects.map(obj => {
        const body = Bodies.fromVertices(obj.position.x, obj.position.y, [obj.vertices], {
            label: obj.label,
            isStatic: obj.isStatic,
            restitution: obj.restitution,
            friction: obj.friction,
            frictionStatic: obj.frictionStatic,
            density: obj.density,
            render: { ...obj.render },
            collisionFilter: { ...obj.collisionFilter }
        });
        
        // Store original ID mapping
        bodiesMap[obj.id] = body;
        
        if (obj.hasFace) {
            body.hasFace = true;
            body.blinkTimer = obj.blinkTimer || Math.random() * 300 + 60;
            body.isBlinking = obj.isBlinking || false;
            body.blinkDuration = obj.blinkDuration || 0;
            body.damage = obj.damage || 0;
            body.isDead = obj.isDead || false;
            body.isBeingDragged = obj.isBeingDragged || false;
            body.emotionTimer = obj.emotionTimer || 0;
            body.lookAtTarget = null; // Reset look target on load
            body.lookTimer = obj.lookTimer || Math.random() * 300 + 120;
            body.isLooking = obj.isLooking || false;
            body.lookDuration = obj.lookDuration || 0;
            body.isSad = obj.isSad || false;
            body.sadTimer = obj.sadTimer || 0;
            body.hasAsymmetricEyes = obj.hasAsymmetricEyes || false; // Restore this property
        }
        Body.setVelocity(body, obj.velocity);
        Body.setAngularVelocity(body, obj.angularVelocity);
        Body.setAngle(body, obj.angle); // Set angle after creation
        body.customName = obj.customName;
        body.isRainbowName = obj.isRainbowName || false;
        body.isGlitchName = obj.isGlitchName || false; // removed isGoldName / isShadowName
        return body;
    });
    
    Composite.add(world, newBodies);
    
    // Restore constraints/welds if they exist
    weldingConstraints = [];
    if (state.constraints && state.constraints.length > 0) {
        state.constraints.forEach(constraintData => {
            const bodyA = bodiesMap[constraintData.bodyAId];
            const bodyB = bodiesMap[constraintData.bodyBId];
            
            // Only create constraint if both bodies exist
            if (bodyA && bodyB) {
                const constraint = Matter.Constraint.create({
                    bodyA: bodyA,
                    bodyB: bodyB,
                    length: constraintData.length,
                    stiffness: constraintData.stiffness || 0.8,
                    render: {
                        visible: constraintData.render.visible !== undefined ? 
                            constraintData.render.visible : !invisibleWeldsEnabled,
                        strokeStyle: constraintData.render.strokeStyle || '#27ae60',
                        lineWidth: constraintData.render.lineWidth || 2
                    }
                });
                
                Composite.add(world, constraint);
                weldingConstraints.push(constraint);
            }
        });
    }

    // Update UI
    updateUIFromState();
}

function updateUIFromState() {
    document.getElementById('size-slider').value = ballRadius;
    document.getElementById('random-size-toggle').checked = randomSizesEnabled;
    document.getElementById('random-size-toggle').dispatchEvent(new Event('change'));
    renderColorPickers();
    document.getElementById('bounciness-slider').value = ballBounciness;
    document.getElementById('friction-slider').value = objectFriction;
    document.getElementById('static-friction-slider').value = objectStaticFriction;
    document.getElementById('rotation-toggle').checked = randomRotationEnabled;
    document.getElementById('static-toggle').checked = isStaticEnabled;
    document.getElementById('rotation-speed-slider').value = initialRotationSpeed;
    document.getElementById('lifespan-toggle').checked = lifespanEnabled;
    document.getElementById('faces-toggle').checked = facesEnabled;
    document.getElementById('invincible-faces-toggle').checked = invincibleFacesEnabled;
    document.getElementById('lifespan-toggle').dispatchEvent(new Event('change'));
    document.getElementById('lifespan-slider').value = objectLifespan / 1000;
    document.getElementById('density-slider').value = objectDensity;
    document.getElementById('spawn-speed-slider').value = spawnSpeed;
    document.getElementById('object-collision-toggle').checked = objectCollisionsEnabled;
    document.getElementById('attraction-strength-slider').value = attractionStrength;
    document.getElementById('attraction-radius-slider').value = attractionRadius;
    document.getElementById('explosion-strength-slider').value = explosionStrength;
    document.getElementById('explosion-radius-slider').value = explosionRadius;
    document.getElementById('grid-toggle').checked = gridEnabled;
    document.getElementById('grid-toggle').dispatchEvent(new Event('change'));
    document.getElementById('grid-color-picker').value = gridColor;
    document.getElementById('bg-color-picker').value = backgroundColor;
    document.getElementById('names-toggle').checked = namesEnabled;
    document.getElementById('names-toggle').dispatchEvent(new Event('change'));
    
    // Update manual name UI if it exists in the loaded state
    if (manualNameEnabled && document.getElementById('manual-name-toggle')) {
        document.getElementById('manual-name-toggle').checked = manualNameEnabled;
        document.getElementById('manual-name-toggle').dispatchEvent(new Event('change'));
        
        if (customName && document.getElementById('custom-name-input')) {
            document.getElementById('custom-name-input').value = customName;
        }
    }
    
    updateBackground();
    document.getElementById('gravity-y-slider').value = engine.world.gravity.y;
    document.getElementById('gravity-x-slider').value = engine.world.gravity.x;
    document.getElementById('air-friction-slider').value = engine.airFriction;
    document.getElementById('time-scale-slider').value = engine.timing.timeScale;
    document.getElementById('wall-bounciness-slider').value = boundaries[0].restitution;
}

function spawnBall(x, y) {
    if (ballColors.length === 0) return; // Don't spawn if no colors are available

    const randomColor = randomColorsEnabled ? 
        '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0') :
        ballColors[Math.floor(Math.random() * ballColors.length)];
    const size = randomSizesEnabled ? Matter.Common.random(minBallRadius, maxBallRadius) : ballRadius;
    
    const options = {
        restitution: ballBounciness,
        friction: objectFriction,
        frictionStatic: objectStaticFriction,
        density: objectDensity,
        isStatic: isStaticEnabled,
        angle: randomRotationEnabled ? Math.random() * 2 * Math.PI : 0,
        angularVelocity: initialRotationSpeed,
        collisionFilter: {
            group: objectCollisionsEnabled ? 0 : -1
        },
        render: {
            fillStyle: randomColor
        }
    };

    let ball;
    switch (selectedShape.type) {
        case 'box':
            ball = Bodies.rectangle(x, y, size, size, options);
            stats.polygonsSpawned++;
            break;
        case 'rectangle':
            ball = Bodies.rectangle(x, y, size * 1.5, size, options);
            stats.rectanglesSpawned++;
            break;
        case 'polygon':
            ball = Bodies.polygon(x, y, selectedShape.sides, size, options);
            stats.polygonsSpawned++;
            break;
        case 'trapezoid':
            ball = Bodies.trapezoid(x, y, size, size * 0.8, selectedShape.slope, options);
            stats.polygonsSpawned++;
            break;
        case 'circle':
        default:
            ball = Bodies.circle(x, y, size, options);
            stats.circlesSpawned++;
            break;
    }

    // Increment total spawned count
    stats.totalSpawned++;
    saveStats();

    if (namesEnabled) {
        if (manualNameEnabled && customName) {
            ball.customName = customName;
        } else {
            ball.customName = namePool[Math.floor(Math.random() * namePool.length)];
        }
        // Glitch 1/40, else Rainbow 1/50 (exclusive)
        ball.isGlitchName = Math.random() < (1 / 40);
        ball.isRainbowName = !ball.isGlitchName && (Math.random() < (1 / 50)); // updated from 1/30
        stats.namesGiven++;
        saveStats();
    }

    if (facesEnabled) {
        ball.hasFace = true;
        ball.isInvincible = invincibleFacesEnabled; // Apply invincibility setting
        ball.blinkTimer = Math.random() * 600 + 480; // Random initial blink timer (8-20 seconds)
        ball.isBlinking = false;
        ball.blinkDuration = 0;
        ball.damage = 0; // Track accumulated damage
        ball.isDead = false; // Death state
        ball.isBeingDragged = false; // Dragging state
        ball.emotionTimer = 0; // Timer for temporary emotions
        ball.lookAtTarget = null; // Body to look at
        ball.lookTimer = Math.random() * 300 + 120; // Random look timer (2-7 seconds)
        ball.isLooking = false; // Currently looking at something
        ball.lookDuration = 0; // How long been looking
        ball.isSad = false; // Track sadness state
        ball.sadTimer = 0; // Timer for sadness duration
        // Add asymmetric eyes with 1/20 probability
        ball.hasAsymmetricEyes = Math.random() < 0.05;
        stats.facesCreated++;
        saveStats();
    }

    if (lifespanEnabled && !isStaticEnabled) {
        ball.lifespanTimeout = setTimeout(() => {
            Composite.remove(world, ball);
        }, objectLifespan);
    }

    Composite.add(world, ball);
}

let weldingFirstBody = null;
let weldingConstraints = [];

function handleInteractionStart(e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    // Prevent spawning balls when clicking on UI elements
    if (e.target.closest('#settings-panel') || e.target.closest('#bottom-toolbar') || e.target.closest('#library-panel') || e.target.closest('#templates-library') || e.target.closest('#shapes-library')) {
        return;
    }

    if (currentMode === 'explode') {
        shockwaves.push({
            x: clientX,
            y: clientY,
            radius: 0,
            maxRadius: explosionRadius,
            life: 0,
            maxLife: 30 // frames
        });
        const bodies = Composite.allBodies(world);
        bodies.forEach(body => {
            if (body.isStatic) return;
            const distanceVector = Matter.Vector.sub({ x: clientX, y: clientY }, body.position);
            const distance = Matter.Vector.magnitude(distanceVector);
            if (distance < explosionRadius) {
                const forceMagnitude = explosionStrength * (1 - distance / explosionRadius);
                const force = Matter.Vector.mult(Matter.Vector.normalise(distanceVector), -forceMagnitude);
                Body.applyForce(body, body.position, force);
            }
        });
        stats.explosionsTriggered++;
        saveStats();
        return;
    }

    if (currentMode === 'weld') {
        const bodies = Composite.allBodies(world);
        const foundBodies = Matter.Query.point(bodies, { x: clientX, y: clientY });
        const clickedBody = foundBodies.find(body => !boundaries.includes(body));
        
        if (clickedBody) {
            if (!weldingFirstBody) {
                // Select first body
                weldingFirstBody = clickedBody;
                clickedBody.render.strokeStyle = '#27ae60';
                clickedBody.render.lineWidth = 3;
            } else if (clickedBody !== weldingFirstBody) {
                // Create weld between first and second body
                const constraint = Matter.Constraint.create({
                    bodyA: weldingFirstBody,
                    bodyB: clickedBody,
                    length: Matter.Vector.magnitude(Matter.Vector.sub(weldingFirstBody.position, clickedBody.position)),
                    stiffness: 0.8,
                    render: {
                        visible: !invisibleWeldsEnabled,
                        strokeStyle: '#27ae60',
                        lineWidth: 2
                    }
                });
                
                Composite.add(world, constraint);
                weldingConstraints.push(constraint);
                stats.weldsCreated++;
                saveStats();
                
                // Clear selection styling
                weldingFirstBody.render.strokeStyle = undefined;
                weldingFirstBody.render.lineWidth = undefined;
                weldingFirstBody = null;
            } else {
                // Deselect if clicking the same body
                weldingFirstBody.render.strokeStyle = undefined;
                weldingFirstBody.render.lineWidth = undefined;
                weldingFirstBody = null;
            }
        } else {
            // Clicked empty space, deselect
            if (weldingFirstBody) {
                weldingFirstBody.render.strokeStyle = undefined;
                weldingFirstBody.render.lineWidth = undefined;
                weldingFirstBody = null;
            }
        }
        return;
    }

    isMouseDown = true;

    if (currentMode === 'delete') {
        const bodies = Composite.allBodies(world);
        const foundBodies = Matter.Query.point(bodies, { x: clientX, y: clientY });
        const bodyToDelete = foundBodies.find(body => !boundaries.includes(body));
        if (bodyToDelete) {
            deleteBodyAndConstraints(bodyToDelete);
        }
    } else if (currentMode === 'spawn') {
        spawnBall(clientX, clientY); // Spawn one ball on initial click
    } else if (currentMode === 'attract') {
        // This just activates the attraction in the beforeUpdate loop
        // by setting isMouseDown to true.
    }
    
    // Start interval spawning
    clearInterval(spawnInterval); // Clear any existing interval
    spawnInterval = setInterval(() => {
        if (isMouseDown) {
            // This needs the latest mouse position, which we don't have here.
            // The mousemove event will handle continuous spawning instead.
        }
    }, 1000 / spawnSpeed);
}

function handleInteractionEnd() {
    isMouseDown = false;
    clearInterval(spawnInterval);
}

let lastSpawnTime = 0;
function handleInteractionMove(e) {
    if (!isMouseDown) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    if (currentMode === 'spawn') {
        const now = Date.now();
        if (now - lastSpawnTime > 1000 / spawnSpeed) {
            spawnBall(clientX, clientY);
            lastSpawnTime = now;
        }
    } else if (currentMode === 'delete') {
        const bodies = Composite.allBodies(world);
        const foundBodies = Matter.Query.point(bodies, { x: clientX, y: clientY });
        // Delete all found bodies under the cursor, not just the first one
        foundBodies.forEach(body => {
            if (!boundaries.includes(body)) {
                deleteBodyAndConstraints(body);
            }
        });
    }
    // For 'attract' mode, we don't need to do anything here because
    // the mouse constraint automatically updates mouse.position,
    // which is used by the 'beforeUpdate' event.
}

document.body.addEventListener('mousedown', handleInteractionStart);
document.body.addEventListener('mouseup', handleInteractionEnd);
document.body.addEventListener('mousemove', handleInteractionMove);

document.body.addEventListener('touchstart', handleInteractionStart, { passive: false });
document.body.addEventListener('touchend', handleInteractionEnd);
document.body.addEventListener('touchmove', handleInteractionMove, { passive: false });

// --- Mouse and Mode Controls ---
let currentMode = 'spawn';
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        stiffness: 0.2,
        render: {
            visible: false
        }
    }
});
Composite.add(world, mouseConstraint);
// Initially disable mouse constraint for spawn mode
mouseConstraint.collisionFilter.mask = 0;


function resetAllSettings() {
    // Reset all settings to their default values
    ballRadius = 20;
    randomSizesEnabled = false;
    randomColorsEnabled = false;
    ballColors = ['#C44569', '#D6A2E8', '#786FA6', '#596275', '#2C3A47'];
    ballBounciness = 0.7;
    objectFriction = 0.1;
    objectStaticFriction = 0.5;
    randomRotationEnabled = false;
    isStaticEnabled = false;
    initialRotationSpeed = 0;
    lifespanEnabled = false;
    facesEnabled = false;
    invincibleFacesEnabled = false;
    objectLifespan = 5000;
    selectedShape = { type: 'circle' };
    objectDensity = 0.001;
    spawnSpeed = 20;
    objectCollisionsEnabled = true;
    attractionStrength = 5;
    attractionRadius = 200;
    explosionStrength = 0.05;
    explosionRadius = 150;
    gridEnabled = true;
    gridColor = '#0000FF';
    backgroundColor = '#1a1a1a';
    namesEnabled = false;
    manualNameEnabled = false;
    customName = "";

    engine.world.gravity.y = 1;
    engine.world.gravity.x = 0;
    engine.airFriction = 0.01;
    engine.timing.timeScale = 1;
    boundaries.forEach(wall => wall.restitution = 1);

    // Reset UI that isn't covered by updateUIFromState
    document.getElementById('toolbar-toggle').checked = true;
    document.getElementById('bottom-toolbar').classList.remove('hidden');
    document.getElementById('accelerometer-toggle').checked = false;
    document.getElementById('accelerometer-toggle').dispatchEvent(new Event('change'));

    updateUIFromState();
    alert('All settings have been reset to their default values.');
}

// Statistics functions
function loadStats() {
    try {
        const savedStats = localStorage.getItem('physicsStats');
        if (savedStats) {
            stats = { ...stats, ...JSON.parse(savedStats) };
            updateStatsDisplay();
        }
    } catch (error) {
        console.error("Error loading statistics:", error);
    }
}

function saveStats() {
    try {
        localStorage.setItem('physicsStats', JSON.stringify(stats));
    } catch (error) {
        console.error("Error saving statistics:", error);
    }
}

function updateStatsDisplay() {
    document.getElementById('total-spawned').textContent = stats.totalSpawned.toLocaleString();
    document.getElementById('circles-spawned').textContent = stats.circlesSpawned.toLocaleString();
    document.getElementById('polygons-spawned').textContent = stats.polygonsSpawned.toLocaleString();
    document.getElementById('rectangles-spawned').textContent = stats.rectanglesSpawned.toLocaleString();
    document.getElementById('explosions-triggered').textContent = stats.explosionsTriggered.toLocaleString();
    document.getElementById('objects-deleted').textContent = stats.objectsDeleted.toLocaleString();
    document.getElementById('welds-created').textContent = stats.weldsCreated.toLocaleString();
    document.getElementById('names-given').textContent = stats.namesGiven.toLocaleString();
    document.getElementById('faces-created').textContent = stats.facesCreated.toLocaleString();
    document.getElementById('objects-cleared').textContent = stats.objectsCleared.toLocaleString();
}

function resetStats() {
    if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
        stats = {
            totalSpawned: 0,
            circlesSpawned: 0,
            polygonsSpawned: 0,
            rectanglesSpawned: 0,
            explosionsTriggered: 0,
            objectsDeleted: 0,
            weldsCreated: 0,
            namesGiven: 0,
            facesCreated: 0,
            objectsCleared: 0
        };
        saveStats();
        updateStatsDisplay();
        alert('Statistics have been reset.');
    }
}

// Initialize color pickers and controls
document.addEventListener('DOMContentLoaded', () => {
    customTemplates = getCustomTemplates();
    updateBackground(); // Set initial background
    renderColorPickers();
    populateTemplatesLibrary();
    populateShapesLibrary();
    
    // Load and start tracking play time
    loadPlayTime();
    startPlayTimeTracking();
    
    // Load statistics
    loadStats();

    // Add event listener to save play time when page is about to unload
    window.addEventListener('beforeunload', savePlayTime);

    const spawnBtn = document.getElementById('spawn-mode-btn');
    const dragBtn = document.getElementById('drag-mode-btn'); // Fix: was incorrectly using delete-mode-btn
    const deleteBtn = document.getElementById('delete-mode-btn');
    const explodeBtn = document.getElementById('explode-mode-btn');
    const attractBtn = document.getElementById('attract-mode-btn');
    const weldBtn = document.getElementById('weld-mode-btn');

    function setActiveButton(activeBtn) {
        [spawnBtn, dragBtn, deleteBtn, explodeBtn, attractBtn, weldBtn].forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    function clearWeldingSelection() {
        if (weldingFirstBody) {
            weldingFirstBody.render.strokeStyle = undefined;
            weldingFirstBody.render.lineWidth = undefined;
            weldingFirstBody = null;
        }
    }

    spawnBtn.addEventListener('click', () => {
        currentMode = 'spawn';
        mouseConstraint.collisionFilter.mask = isPaused ? -1 : 0; // Enable dragging if paused
        clearWeldingSelection();
        setActiveButton(spawnBtn);
    });

    dragBtn.addEventListener('click', () => {
        currentMode = 'drag';
        mouseConstraint.collisionFilter.mask = -1; // Always enable dragging for drag mode
        clearWeldingSelection();
        setActiveButton(dragBtn);
    });

    attractBtn.addEventListener('click', () => {
        currentMode = 'attract';
        mouseConstraint.collisionFilter.mask = isPaused ? -1 : 0; // Enable dragging if paused
        clearWeldingSelection();
        setActiveButton(attractBtn);
    });

    weldBtn.addEventListener('click', () => {
        currentMode = 'weld';
        mouseConstraint.collisionFilter.mask = isPaused ? -1 : 0; // Enable dragging if paused
        setActiveButton(weldBtn);
    });

    deleteBtn.addEventListener('click', () => {
        currentMode = 'delete';
        mouseConstraint.collisionFilter.mask = isPaused ? -1 : 0; // Enable dragging if paused
        clearWeldingSelection();
        setActiveButton(deleteBtn);
    });

    explodeBtn.addEventListener('click', () => {
        currentMode = 'explode';
        mouseConstraint.collisionFilter.mask = isPaused ? -1 : 0; // Enable dragging if paused
        clearWeldingSelection();
        setActiveButton(explodeBtn);
    });

    document.getElementById('add-color-btn').addEventListener('click', addColor);
    document.getElementById('remove-color-btn').addEventListener('click', removeColor);
    document.getElementById('clear-balls-btn').addEventListener('click', clearBalls);
    document.getElementById('save-template-btn').addEventListener('click', saveCustomTemplate);

    document.getElementById('save-state-btn').addEventListener('click', saveState);
    const loadStateInput = document.getElementById('load-state-input');
    document.getElementById('load-state-btn').addEventListener('click', () => {
        loadStateInput.click();
    });
    loadStateInput.addEventListener('change', (e) => {
                       const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const state = JSON.parse(event.target.result);
                loadState(state);
            } catch (error) {
                console.error("Error loading or parsing state file:", error);
                alert("Failed to load state. The file might be corrupted or in the wrong format.");
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset input so same file can be loaded again
    });

    document.getElementById('reset-settings-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all settings to their defaults? This cannot be undone.')) {
            resetAllSettings();
        }
    });

    document.getElementById('reset-stats-btn').addEventListener('click', resetStats);

    const pauseBtn = document.getElementById('pause-btn');
    pauseBtn.addEventListener('click', () => {
        runner.enabled = !runner.enabled;
        isPaused = !runner.enabled; // Update pause state
        
        // When paused, always enable dragging regardless of current mode
        if (isPaused) {
            mouseConstraint.collisionFilter.mask = -1; // Enable dragging
        } else {
            // When unpaused, restore mode-appropriate dragging behavior
            if (currentMode === 'drag') {
                mouseConstraint.collisionFilter.mask = -1;
            } else {
                mouseConstraint.collisionFilter.mask = 0;
            }
        }
        
        pauseBtn.textContent = runner.enabled ? 'Pause Simulation' : 'Resume Simulation';
    });

    const sizeSliderContainer = document.getElementById('size-slider-container');
    document.getElementById('random-size-toggle').addEventListener('change', (e) => {
        randomSizesEnabled = e.target.checked;
        sizeSliderContainer.style.display = randomSizesEnabled ? 'none' : 'block';
    });

    document.getElementById('random-color-toggle').addEventListener('change', (e) => {
        randomColorsEnabled = e.target.checked;
    });

    document.getElementById('size-slider').addEventListener('input', (e) => {
        ballRadius = parseInt(e.target.value, 10);
    });

    document.getElementById('spawn-speed-slider').addEventListener('input', (e) => {
        spawnSpeed = parseInt(e.target.value, 10);
    });

    document.getElementById('time-scale-slider').addEventListener('input', (e) => {
        engine.timing.timeScale = parseFloat(e.target.value);
    });

    document.getElementById('gravity-y-slider').addEventListener('input', (e) => {
        engine.world.gravity.y = parseFloat(e.target.value);
    });

    document.getElementById('gravity-x-slider').addEventListener('input', (e) => {
        engine.world.gravity.x = parseFloat(e.target.value);
    });

    const gravityYSlider = document.getElementById('gravity-y-slider');
    const gravityXSlider = document.getElementById('gravity-x-slider');
    let accelerometerEnabled = false;

    function handleOrientation(event) {
        if (!accelerometerEnabled) return;
        // Beta = front-to-back tilt, Gamma = left-to-right tilt
        const { beta, gamma } = event;
        // Normalize and scale gravity
        engine.world.gravity.y = beta / 90;
        engine.world.gravity.x = gamma / 90;
    }

    document.getElementById('accelerometer-toggle').addEventListener('change', (e) => {
        accelerometerEnabled = e.target.checked;
        gravityYSlider.disabled = accelerometerEnabled;
        gravityXSlider.disabled = accelerometerEnabled;

        if (accelerometerEnabled) {
            // Check for permission if it's a newer API
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                DeviceOrientationEvent.requestPermission()
                    .then(permissionState => {
                        if (permissionState === 'granted') {
                            window.addEventListener('deviceorientation', handleOrientation);
                        }
                    })
                    .catch(console.error);
            } else {
                // Handle regular case
                window.addEventListener('deviceorientation', handleOrientation);
            }
        } else {
            window.removeEventListener('deviceorientation', handleOrientation);
            // Reset to slider values
            engine.world.gravity.y = parseFloat(gravityYSlider.value);
            engine.world.gravity.x = parseFloat(gravityXSlider.value);
        }
    });

    document.getElementById('bounciness-slider').addEventListener('input', (e) => {
        ballBounciness = parseFloat(e.target.value);
    });

    document.getElementById('friction-slider').addEventListener('input', (e) => {
        objectFriction = parseFloat(e.target.value);
    });

    document.getElementById('static-friction-slider').addEventListener('input', (e) => {
        objectStaticFriction = parseFloat(e.target.value);
    });

    document.getElementById('density-slider').addEventListener('input', (e) => {
        objectDensity = parseFloat(e.target.value);
    });

    document.getElementById('object-collision-toggle').addEventListener('change', (e) => {
        objectCollisionsEnabled = e.target.checked;
    });

    document.getElementById('air-friction-slider').addEventListener('input', (e) => {
        engine.airFriction = parseFloat(e.target.value);
    });

    document.getElementById('static-toggle').addEventListener('change', (e) => {
        isStaticEnabled = e.target.checked;
    });

    document.getElementById('rotation-toggle').addEventListener('change', (e) => {
        randomRotationEnabled = e.target.checked;
    });

    document.getElementById('faces-toggle').addEventListener('change', (e) => {
        facesEnabled = e.target.checked;
        // Show/hide invincible faces toggle based on faces toggle
        const invincibleFacesContainer = document.getElementById('invincible-faces-container');
        invincibleFacesContainer.style.display = facesEnabled ? 'flex' : 'none';
    });
    
    document.getElementById('invincible-faces-toggle').addEventListener('change', (e) => {
        invincibleFacesEnabled = e.target.checked;
    });

    document.getElementById('names-toggle').addEventListener('change', (e) => {
        namesEnabled = e.target.checked;
        
        // Show/hide manual name container based on names toggle
        const manualNameContainer = document.getElementById('manual-name-container');
        if (manualNameContainer) {
            manualNameContainer.style.display = namesEnabled ? 'block' : 'none';
        }
    });
    
    // Add event listener for manual name toggle
    document.getElementById('manual-name-toggle').addEventListener('change', (e) => {
        manualNameEnabled = e.target.checked;
        
        // Show/hide custom name input based on manual name toggle
        const customNameInputContainer = document.getElementById('custom-name-input-container');
        if (customNameInputContainer) {
            customNameInputContainer.style.display = manualNameEnabled ? 'block' : 'none';
        }
    });
    
    // Add event listener for custom name input
    document.getElementById('custom-name-input').addEventListener('input', (e) => {
        customName = e.target.value;
    });

    document.getElementById('rotation-speed-slider').addEventListener('input', (e) => {
        initialRotationSpeed = parseFloat(e.target.value);
    });

    const lifespanSliderContainer = document.getElementById('lifespan-slider-container');
    document.getElementById('lifespan-toggle').addEventListener('change', (e) => {
        lifespanEnabled = e.target.checked;
        lifespanSliderContainer.style.display = lifespanEnabled ? 'block' : 'none';
    });

    document.getElementById('lifespan-slider').addEventListener('input', (e) => {
        objectLifespan = parseInt(e.target.value, 10) * 1000;
    });

    // World Settings
    document.getElementById('wall-bounciness-slider').addEventListener('input', (e) => {
        const bounciness = parseFloat(e.target.value);
        boundaries.forEach(wall => wall.restitution = bounciness);
    });

    document.getElementById('attraction-strength-slider').addEventListener('input', (e) => {
        attractionStrength = parseFloat(e.target.value);
    });

    document.getElementById('attraction-radius-slider').addEventListener('input', (e) => {
        attractionRadius = parseInt(e.target.value, 10);
    });

    document.getElementById('explosion-strength-slider').addEventListener('input', (e) => {
        explosionStrength = parseFloat(e.target.value);
    });

    document.getElementById('explosion-radius-slider').addEventListener('input', (e) => {
        explosionRadius = parseInt(e.target.value, 10);
    });

    document.getElementById('invisible-welds-toggle').addEventListener('change', (e) => {
        invisibleWeldsEnabled = e.target.checked;
    });

    Events.on(render, 'afterRender', (event) => {
        const context = render.context;

        // Draw faces on bodies
        const bodies = Composite.allBodies(world);
        bodies.forEach(body => {
            if (body.hasFace) {
                // Update blinking logic (only if alive)
                if (!body.isDead) {
                    if (body.isBlinking) {
                        body.blinkDuration++;
                        if (body.blinkDuration >= 8) { // Blink lasts 8 frames
                            body.isBlinking = false;
                            body.blinkDuration = 0;
                            body.blinkTimer = Math.random() * 600 + 480; // Next blink in 8-20 seconds
                        }
                    } else {
                        body.blinkTimer--;
                        if (body.blinkTimer <= 0) {
                            body.isBlinking = true;
                            body.blinkDuration = 0;
                        }
                    }
                }

                // Update sadness timer
                if (body.isSad && body.sadTimer > 0) {
                    body.sadTimer--;
                    if (body.sadTimer <= 0) {
                        body.isSad = false;
                    }
                }

                // Update emotion timer
                if (body.emotionTimer > 0) {
                    body.emotionTimer--;
                }

                // Update looking behavior (only if alive and not being dragged)
                if (!body.isDead && !body.isBeingDragged) {
                    if (body.isLooking) {
                        body.lookDuration++;
                        // Stop looking after 5-7 seconds
                        if (body.lookDuration >= Math.random() * 120 + 300) {
                            body.isLooking = false;
                            body.lookAtTarget = null;
                            body.lookDuration = 0;
                            body.lookTimer = Math.random() * 300 + 120; // Next look in 2-7 seconds
                        }
                    } else {
                        body.lookTimer--;
                        if (body.lookTimer <= 0) {
                            // Find a nearby face to look at (more often now)
                            if (Math.random() < 0.6) { // 60% chance when timer expires
                                const nearbyBodies = bodies.filter(otherBody => 
                                    otherBody !== body && 
                                    otherBody.hasFace && 
                                    !otherBody.isDead &&
                                    Matter.Vector.magnitude(Matter.Vector.sub(body.position, otherBody.position)) < 150
                                );
                                if (nearbyBodies.length > 0) {
                                    body.lookAtTarget = nearbyBodies[Math.floor(Math.random() * nearbyBodies.length)];
                                    body.isLooking = true;
                                    body.lookDuration = 0;
                                }
                            }
                            if (!body.isLooking) {
                                body.lookTimer = Math.random() * 300 + 120; // Reset timer if not looking
                            }
                        }
                    }
                }

                const pos = body.position;
                const angle = body.angle;
                
                // Find an approximate radius for non-circular shapes (consistent regardless of rotation)
                let radius = body.circleRadius;
                if (!radius) {
                    // Calculate a consistent radius based on the body's bounds at 0 rotation
                    const bounds = body.bounds;
                    const width = bounds.max.x - bounds.min.x;
                    const height = bounds.max.y - bounds.min.y;
                    radius = Math.min(width, height) / 2 * 0.6; // Use smaller dimension for consistency
                }

                context.save();
                context.translate(pos.x, pos.y);
                context.rotate(angle);

                // Eyes
                const eyeRadius = radius * 0.15;
                const eyeOffsetX = radius * 0.35;
                const eyeOffsetY = -radius * 0.2;
                
                if (body.isDead) {
                    // Draw X eyes for dead bodies
                    context.strokeStyle = 'black';
                    context.lineWidth = radius * 0.08;
                    // Left eye X
                    context.beginPath();
                    context.moveTo(-eyeOffsetX - eyeRadius * 0.7, eyeOffsetY - eyeRadius * 0.7);
                    context.lineTo(-eyeOffsetX + eyeRadius * 0.7, eyeOffsetY + eyeRadius * 0.7);
                    context.moveTo(-eyeOffsetX + eyeRadius * 0.7, eyeOffsetY - eyeRadius * 0.7);
                    context.lineTo(-eyeOffsetX - eyeRadius * 0.7, eyeOffsetY + eyeRadius * 0.7);
                    context.stroke();
                    // Right eye X
                    context.beginPath();
                    context.moveTo(eyeOffsetX - eyeRadius * 0.7, eyeOffsetY - eyeRadius * 0.7);
                    context.lineTo(eyeOffsetX + eyeRadius * 0.7, eyeOffsetY + eyeRadius * 0.7);
                    context.moveTo(eyeOffsetX + eyeRadius * 0.7, eyeOffsetY - eyeRadius * 0.7);
                    context.lineTo(eyeOffsetX - eyeRadius * 0.7, eyeOffsetY + eyeRadius * 0.7);
                    context.stroke();
                } else if (body.isBeingDragged && body.emotionTimer > 0) {
                    // Draw scared/surprised eyes (large circles)
                    context.fillStyle = 'white';
                    const scaredEyeRadius = eyeRadius * 1.5;
                    context.beginPath();
                    context.arc(-eyeOffsetX, eyeOffsetY, scaredEyeRadius, 0, 2 * Math.PI);
                    context.fill();
                    context.beginPath();
                    context.arc(eyeOffsetX, eyeOffsetY, scaredEyeRadius, 0, 2 * Math.PI);
                    context.fill();

                    // Large pupils
                    context.fillStyle = 'black';
                    context.beginPath();
                    context.arc(-eyeOffsetX, eyeOffsetY, scaredEyeRadius * 0.6, 0, 2 * Math.PI);
                    context.fill();
                    context.beginPath();
                    context.arc(eyeOffsetX, eyeOffsetY, scaredEyeRadius * 0.6, 0, 2 * Math.PI);
                    context.fill();
                } else if (body.isBlinking) {
                    // Draw closed eyes (horizontal lines)
                    context.strokeStyle = 'black';
                    context.lineWidth = radius * 0.08;
                    context.beginPath();
                    context.moveTo(-eyeOffsetX - eyeRadius * 0.8, eyeOffsetY);
                    context.lineTo(-eyeOffsetX + eyeRadius * 0.8, eyeOffsetY);
                    context.stroke();
                    context.beginPath();
                    context.moveTo(eyeOffsetX - eyeRadius * 0.8, eyeOffsetY);
                    context.lineTo(eyeOffsetX + eyeRadius * 0.8, eyeOffsetY);
                    context.stroke();
                } else {
                    // Draw normal open eyes
                    context.fillStyle = 'white';
                    
                    // Define eye sizes - check for asymmetric eyes
                    let leftEyeRadius = eyeRadius;
                    let rightEyeRadius = eyeRadius;
                    
                    if (body.hasAsymmetricEyes) {
                        // Make left eye 50% larger
                        leftEyeRadius = eyeRadius * 1.5;
                    }
                    
                    // Left eye
                    context.beginPath();
                    context.arc(-eyeOffsetX, eyeOffsetY, leftEyeRadius, 0, 2 * Math.PI);
                    context.fill();
                    
                    // Right eye
                    context.beginPath();
                    context.arc(eyeOffsetX, eyeOffsetY, rightEyeRadius, 0, 2 * Math.PI);
                    context.fill();

                    // Pupils
                    context.fillStyle = 'black';
                    
                    // Pupils - adjust position if looking at target
                    let pupilOffsetX = 0;
                    let pupilOffsetY = 0;
                    
                    if (body.isLooking && body.lookAtTarget) {
                        // Calculate direction to look target
                        const lookDirection = Matter.Vector.sub(body.lookAtTarget.position, body.position);
                        const lookAngle = Math.atan2(lookDirection.y, lookDirection.x) - angle;
                        
                        // Move pupils toward look direction (limited movement)
                        pupilOffsetX = Math.cos(lookAngle) * eyeRadius * 0.3;
                        pupilOffsetY = Math.sin(lookAngle) * eyeRadius * 0.3;
                    }
                    
                    // Adjust pupil size based on eye size
                    const leftPupilRadius = leftEyeRadius * 0.5;
                    const rightPupilRadius = rightEyeRadius * 0.5;
                    
                    context.beginPath();
                    context.arc(-eyeOffsetX + pupilOffsetX, eyeOffsetY + pupilOffsetY, leftPupilRadius, 0, 2 * Math.PI);
                    context.fill();
                    context.beginPath();
                    context.arc(eyeOffsetX + pupilOffsetX, eyeOffsetY + pupilOffsetY, rightPupilRadius, 0, 2 * Math.PI);
                    context.fill();
                }

                // Mouth
                const mouthOffsetY = radius * 0.3;
                const mouthWidth = radius * 0.6;
                context.lineWidth = radius * 0.1;
                context.strokeStyle = 'black';
                
                if (body.isDead) {
                    // Draw flat line mouth for dead bodies
                    context.beginPath();
                    context.moveTo(-mouthWidth * 0.5, mouthOffsetY);
                    context.lineTo(mouthWidth * 0.5, mouthOffsetY);
                    context.stroke();
                } else if (body.isBeingDragged && body.emotionTimer > 0) {
                    // Draw scared mouth (small O shape)
                    context.beginPath();
                    context.arc(0, mouthOffsetY, mouthWidth * 0.3, 0, 2 * Math.PI);
                    context.stroke();
                } else if (body.isSad) {
                    // Draw sad mouth (upside down smile)
                    context.beginPath();
                    context.arc(0, mouthOffsetY + mouthWidth * 0.3, mouthWidth, 1.2 * Math.PI, 1.8 * Math.PI);
                    context.stroke();
                } else {
                    // Draw normal smile
                    context.beginPath();
                    context.arc(0, mouthOffsetY, mouthWidth, 0.2 * Math.PI, 0.8 * Math.PI);
                    context.stroke();
                }

                context.restore();
            }

            if (body.customName) {
                const pos = body.position;
                let radius = body.circleRadius;
                if (!radius) {
                    const bounds = body.bounds;
                    const width = bounds.max.x - bounds.min.x;
                    const height = bounds.max.y - bounds.min.y;
                    radius = Math.max(width, height) / 2;
                }
                context.save();
                context.translate(pos.x, pos.y);
                context.font = '12px sans-serif';
                context.textAlign = 'center';
                if (body.isGlitchName) {
                    const baseY = -radius - 5;
                    const glitchShift = (Math.random() < 0.15) ? (Math.random() * 6 - 3) : 0;
                    const layers = [
                        { color: '#ff00ff', dx: -1.5, dy: 0 },
                        { color: '#00ffff', dx: 1.5, dy: 0 },
                        { color: '#ffffff', dx: glitchShift, dy: 0 }
                    ];
                    layers.forEach(l => {
                        context.fillStyle = l.color;
                        context.fillText(body.customName, l.dx, baseY + l.dy);
                    });
                } else if (body.isRainbowName) {
                    const t = Date.now() * 0.001;
                    const gradient = context.createLinearGradient(-radius, 0, radius, 0);
                    for (let i = 0; i <= 1; i += 0.2) {
                        const hue = (t * 60 + i * 360) % 360;
                        gradient.addColorStop(i, `hsl(${hue},100%,50%)`);
                    }
                    context.fillStyle = gradient;
                    context.fillText(body.customName, 0, -radius - 5);
                } else {
                    context.fillStyle = 'white';
                    context.fillText(body.customName, 0, -radius - 5);
                }
                context.restore();
            }
        });

        shockwaves.forEach((shockwave, index) => {
            // Update shockwave
            shockwave.life++;
            shockwave.radius = (shockwave.life / shockwave.maxLife) * shockwave.maxRadius;

            if (shockwave.life >= shockwave.maxLife) {
                shockwaves.splice(index, 1);
                return;
            }

            // Draw shockwave
            const opacity = 1 - (shockwave.life / shockwave.maxLife);
            context.beginPath();
            context.arc(shockwave.x, shockwave.y, shockwave.radius, 0, 2 * Math.PI);
            context.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            context.lineWidth = 3;
            context.stroke();
        });
    });

    // Collision damage system
    Events.on(engine, 'collisionStart', (event) => {
        const pairs = event.pairs;
        pairs.forEach(pair => {
            const { bodyA, bodyB } = pair;
            
            // Only process bodies with faces that aren't already dead and aren't invincible
            [bodyA, bodyB].forEach(body => {
                if (body.hasFace && !body.isDead && !boundaries.includes(body) && !body.isInvincible) {
                    // Calculate impact force based on velocity
                    const speed = Matter.Vector.magnitude(body.velocity);
                    const damage = Math.max(0, speed - 4.8); // Damage threshold increased from 3 to 4.8 (60% higher velocity tolerance)
                    
                    if (damage > 0) {
                        body.damage += damage * 0.5; // Scale damage
                        
                        // Check if body should die
                        if (body.damage > 13) { // Death threshold
                            body.isDead = true;
                            body.isBlinking = false;
                            // Make dead bodies less bouncy
                            body.restitution *= 0.3;
                            
                            // Make nearby faces sad
                            const sadnessRadius = 150; // Range to detect death
                            const bodies = Composite.allBodies(world);
                            bodies.forEach(nearbyBody => {
                                if (nearbyBody.hasFace && !nearbyBody.isDead && nearbyBody !== body) {
                                    const distance = Matter.Vector.magnitude(
                                        Matter.Vector.sub(body.position, nearbyBody.position)
                                    );
                                    
                                    if (distance < sadnessRadius) {
                                        nearbyBody.isSad = true;
                                        nearbyBody.sadTimer = 600; // 10 seconds (60 frames per second)
                                    }
                                }
                            });
                        }
                    }
                }
            });
        });
    });

    Events.on(engine, 'beforeUpdate', () => {
        // Check for bodies being dragged
        const bodies = Composite.allBodies(world);
        bodies.forEach(body => {
            if (body.hasFace && !body.isDead) {
                // Check if body is being dragged by mouse constraint
                const wasBeingDragged = body.isBeingDragged;
                body.isBeingDragged = (mouseConstraint.body === body);
                
                // If just started being dragged, set emotion timer
                if (body.isBeingDragged && !wasBeingDragged) {
                    body.emotionTimer = 60; // Show scared face for 1 second (60 frames)
                }
            }
        });

        if (currentMode === 'attract' && isMouseDown && mouse.position.x) {
            const bodies = Composite.allBodies(world);
            const basePullForce = 0.0005;
            const pullForce = basePullForce * attractionStrength;
            bodies.forEach(body => {
                if (body.isStatic) return;
                const distanceVector = Matter.Vector.sub(mouse.position, body.position);
                const distance = Matter.Vector.magnitude(distanceVector);
                if (distance < attractionRadius) {
                    const forceMagnitude = pullForce * (1 - distance / attractionRadius) * body.mass;
                    const force = Matter.Vector.mult(Matter.Vector.normalise(distanceVector), forceMagnitude);
                    Body.applyForce(body, body.position, force);
                }
            });
        }
    });


    // UI Settings
    document.getElementById('toolbar-toggle').addEventListener('change', (e) => {
        document.getElementById('bottom-toolbar').classList.toggle('hidden', !e.target.checked);
    });

    // Background and Grid controls
    const gridToggle = document.getElementById('grid-toggle');
    const gridColorContainer = document.getElementById('grid-color-container');

    gridToggle.addEventListener('change', (e) => {
        gridEnabled = e.target.checked;
        gridColorContainer.style.display = gridEnabled ? 'flex' : 'none';
        updateBackground();
    });

    document.getElementById('grid-color-picker').addEventListener('input', (e) => {
        gridColor = e.target.value;
        updateBackground();
    });

    document.getElementById('bg-color-picker').addEventListener('input', (e) => {
        backgroundColor = e.target.value;
        updateBackground();
    });



    const settingsPanel = document.getElementById('settings-panel');
    const toggleBtn = document.getElementById('toggle-settings-btn');
    document.getElementById('settings-header').addEventListener('click', (e) => {
        if (e.target.id === 'toggle-settings-btn') return; // Don't toggle if button is clicked
        settingsPanel.classList.toggle('minimized');
        toggleBtn.textContent = settingsPanel.classList.contains('minimized') ? '+' : '-';
    });
    toggleBtn.addEventListener('click', () => {
        settingsPanel.classList.toggle('minimized');
        toggleBtn.textContent = settingsPanel.classList.contains('minimized') ? '+' : '-';
    });

    // Library Panel controls
    const libraryPanel = document.getElementById('library-panel');
    const toggleLibraryBtn = document.getElementById('toggle-library-panel-btn');
    document.getElementById('library-header').addEventListener('click', (e) => {
        if (e.target.id === 'toggle-library-panel-btn') return;
        libraryPanel.classList.toggle('minimized');
        toggleLibraryBtn.textContent = libraryPanel.classList.contains('minimized') ? '+' : '-';
   
    });
    toggleLibraryBtn.addEventListener('click', () => {
        libraryPanel.classList.toggle('minimized');
        toggleLibraryBtn.textContent = libraryPanel.classList.contains('minimized') ? '+' : '-';
    });

    document.getElementById('open-library-btn').addEventListener('click', () => {
        templatesLibrary.classList.remove('hidden');
    });

    document.getElementById('close-library-btn').addEventListener('click', () => {
        templatesLibrary.classList.add('hidden');
    });

    // Shapes Library controls
    document.getElementById('open-shapes-library-btn').addEventListener('click', () => {
        shapesLibrary.classList.remove('hidden');
    });

    document.getElementById('close-shapes-library-btn').addEventListener('click', () => {
        shapesLibrary.classList.add('hidden');
    });

    shapesLibrary.addEventListener('click', (e) => {
        if (e.target.id === 'shapes-library') {
            shapesLibrary.classList.add('hidden');
        }
    });

    // Close library if clicking on the background overlay for templates
    templatesLibrary.addEventListener('click', (e) => {
        if (e.target.id === 'templates-library') {
            templatesLibrary.classList.add('hidden');
        }
    });

    // Close library if clicking on the background overlay for shapes
    shapesLibrary.addEventListener('click', (e) => {
        if (e.target.id === 'shapes-library') {
            shapesLibrary.classList.add('hidden');
        }
    });
});

function deleteBodyAndConstraints(body) {
    // Clear lifespan timeout if exists
    if (body.lifespanTimeout) {
        clearTimeout(body.lifespanTimeout);
    }
    
    // Remove any constraints connected to this body
    const constraintsToRemove = weldingConstraints.filter(constraint => 
        constraint.bodyA === body || constraint.bodyB === body
    );
    
    constraintsToRemove.forEach(constraint => {
        Composite.remove(world, constraint);
        const index = weldingConstraints.indexOf(constraint);
        if (index > -1) {
            weldingConstraints.splice(index, 1);
        }
    });
    
    // Clear selection if this body was selected for welding
    if (weldingFirstBody === body) {
        weldingFirstBody = null;
    }
    
    // Remove the body
    Composite.remove(world, body);
    
    // Increment deletion counter
    stats.objectsDeleted++;
    saveStats();
}

function clearBalls() {
    const allBodies = Composite.allBodies(world);
    const bodiesToRemove = allBodies.filter(body => {
        if (body.lifespanTimeout) {
            clearTimeout(body.lifespanTimeout);
        }
        return !boundaries.includes(body);
    });
    
    // Clear all welding constraints
    weldingConstraints.forEach(constraint => {
        Composite.remove(world, constraint);
    });
    weldingConstraints = [];
    
    // Clear welding selection
    weldingFirstBody = null;
    
    const countRemoved = bodiesToRemove.length;
    if (countRemoved > 0) {
        stats.objectsCleared += countRemoved;
        saveStats();
    }
    
    Composite.remove(world, bodiesToRemove);
}

// Play time tracking functions
function loadPlayTime() {
    try {
        const savedTime = localStorage.getItem('physicsPlayTime');
        if (savedTime) {
            totalPlayTimeSeconds = parseInt(savedTime, 10) || 0;
            updatePlayTimeDisplay();
        }
    } catch (error) {
        console.error("Error loading play time:", error);
    }
}

function savePlayTime() {
    try {
        localStorage.setItem('physicsPlayTime', totalPlayTimeSeconds.toString());
        lastSaveTime = Date.now();
    } catch (error) {
        console.error("Error saving play time:", error);
    }
}

function startPlayTimeTracking() {
    // Clear any existing interval
    clearInterval(playTimeInterval);
    
    // Start new interval that updates every second
    playTimeInterval = setInterval(() => {
        if (!isPaused) {
            totalPlayTimeSeconds++;
            updatePlayTimeDisplay();
            
            // Save to localStorage periodically
            if (Date.now() - lastSaveTime > SAVE_INTERVAL) {
                savePlayTime();
            }
        }
    }, 1000);
}

function updatePlayTimeDisplay() {
    const hours = Math.floor(totalPlayTimeSeconds / 3600);
    const minutes = Math.floor((totalPlayTimeSeconds % 3600) / 60);
    
    const playTimeDisplay = document.getElementById('play-time-display');
    if (playTimeDisplay) {
        playTimeDisplay.textContent = `${hours}h ${minutes}m`;
    }
}