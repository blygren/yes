(function() {
  const milkRain = document.getElementById('milkRain');
  const MAX_DROPS = 100;
  const DESPAWN_TIME = 15000; // 15 seconds
  const MAGNET_STRENGTH = 0.008;
  const MAGNET_RADIUS = 450;
  const NAME_CHANCE = 0.03; // 3% chance
  let drops = [];
  let namedDrops = [];
  let engine, world, runner;
  let mousePos = { x: 0, y: 0 };
  let elementBodies = [];
  let uiPhysicsEnabled = false;
  let uiElements = [];
  
  // Random milk names
  const milkNames = [
    'Milky', 'Creamy', 'Dairy', 'Moo', 'Calcium', 'Buttercup', 'Latte', 'Vanilla',
    'Cocoa', 'Cookie', 'Butter', 'Cheese', 'Yogurt', 'Splash', 'Droplet', 'Mocha',
    'Cream', 'Whey', 'Silk', 'Cloud', 'Float', 'Moo-Moo', 'Choco', 'Pudding',
    'Smoothie', 'Shake', 'Froth', 'Foam', 'Lactose', 'Pearl', 'Snow', 'Cotton'
  ];
  
  function getRandomName() {
    return milkNames[Math.floor(Math.random() * milkNames.length)];
  }
  
  // Create floor element
  const floor = document.createElement('div');
  floor.className = 'floor';
  document.body.appendChild(floor);
  
  // Setup Matter.js
  const { Engine, World, Bodies, Body, Events } = Matter;
  engine = Engine.create();
  world = engine.world;
  world.gravity.y = 0.5;
  
  // Create invisible floor at bottom
  const floorBody = Bodies.rectangle(
    window.innerWidth / 2,
    window.innerHeight + 10,
    window.innerWidth * 2,
    20,
    { isStatic: true, restitution: 0.3, friction: 0.8 }
  );
  World.add(world, floorBody);
  
  // Create walls
  const leftWall = Bodies.rectangle(-10, window.innerHeight / 2, 20, window.innerHeight * 2, { isStatic: true });
  const rightWall = Bodies.rectangle(window.innerWidth + 10, window.innerHeight / 2, 20, window.innerHeight * 2, { isStatic: true });
  World.add(world, [leftWall, rightWall]);
  
  // Create collision bodies for page elements (only non-text visuals / interactive elements)
  function createElementBodies() {
    // Remove existing element bodies
    elementBodies.forEach(body => World.remove(world, body));
    elementBodies = [];

    // Only target visual/interactive items — avoid headings, paragraphs and other plain text nodes
    const selectors = [
      '.play-button',   // interactive button
      '.tile',          // roadmap cards
      '.tile img',      // tile images
      '.badge',         // small visual badges
      '.gallery-tile',  // gallery cards
      '.gallery-tile img' // gallery images
    ];

    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        // Skip if element is not visible
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;

        // Extra safeguard: ignore plain text-only tags even if matched accidentally
        const tag = el.tagName.toLowerCase();
        const textTags = ['h1','h2','h3','h4','h5','h6','p','span','small'];
        if (textTags.includes(tag)) return;

        // Create a static body for the element
        const body = Bodies.rectangle(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
          rect.width,
          rect.height,
          {
            isStatic: true,
            restitution: 0.6,
            friction: 0.1
          }
        );
        World.add(world, body);
        elementBodies.push(body);
      });
    });
  }
  
  // Initial creation of element bodies
  setTimeout(createElementBodies, 100);
  
  function removeDrop(drop) {
    const index = drops.indexOf(drop);
    if (index > -1) {
      drops.splice(index, 1);
      World.remove(world, drop.body);
      if (drop.element.parentNode) {
        drop.element.remove();
      }
      if (drop.nametag && drop.nametag.parentNode) {
        drop.nametag.remove();
      }
    }
  }
  
  function createNamedMilkDrop(name) {
    const size = 28 + Math.random() * 16;
    const x = Math.random() * (window.innerWidth - 200) + 100;
    
    // Create Matter.js body
    const body = Bodies.circle(x, -100, size / 2, {
      restitution: 0.5,
      friction: 0.2,
      density: 0.001,
      angle: Math.random() * Math.PI * 2
    });
    
    World.add(world, body);
    
    // Create nametag (smaller size)
    const nametag = document.createElement('div');
    nametag.className = 'milk-nametag';
    nametag.textContent = name;
    
    // Create DOM element
    const drop = document.createElement('div');
    drop.className = 'milk-drop named-milk';
    drop.style.width = `${size}px`;
    drop.style.height = `${size}px`;
    drop.style.opacity = '0.7';
    drop.style.filter = 'drop-shadow(0 0 8px rgba(106,209,255,0.6))';
    
    milkRain.appendChild(nametag);
    milkRain.appendChild(drop);
    
    const dropData = { 
      element: drop,
      nametag: nametag,
      body: body,
      name: name,
      isNamed: true
    };
    
    namedDrops.push(dropData);
    return dropData;
  }
  
  function createMilkDrop() {
    if (drops.length >= MAX_DROPS) return;
    
    const size = 20 + Math.random() * 24;
    const x = Math.random() * window.innerWidth;
    const hasName = Math.random() < NAME_CHANCE; // 3% chance
    const randomName = hasName ? getRandomName() : null;
    
    // Create Matter.js body
    const body = Bodies.circle(x, -50, size / 2, {
      restitution: 0.4,
      friction: 0.3,
      density: 0.001,
      angle: Math.random() * Math.PI * 2
    });
    
    World.add(world, body);
    
    // Create nametag only if has name
    let nametag = null;
    if (hasName) {
      nametag = document.createElement('div');
      nametag.className = 'milk-nametag milk-nametag-small';
      nametag.textContent = randomName;
      milkRain.appendChild(nametag);
    }
    
    // Create DOM element
    const drop = document.createElement('div');
    drop.className = 'milk-drop';
    drop.style.width = `${size}px`;
    drop.style.height = `${size}px`;
    drop.style.opacity = 0.3 + Math.random() * 0.3;
    
    milkRain.appendChild(drop);
    
    const dropData = { 
      element: drop,
      nametag: nametag,
      body: body,
      name: randomName,
      createdAt: Date.now(),
      isNamed: false
    };
    
    drops.push(dropData);
    
    // Schedule despawn
    setTimeout(() => {
      // Fade out
      drop.style.transition = 'opacity 1s';
      drop.style.opacity = '0';
      if (nametag) {
        nametag.style.transition = 'opacity 1s';
        nametag.style.opacity = '0';
      }
      setTimeout(() => removeDrop(dropData), 1000);
    }, DESPAWN_TIME);
  }
  
  // Enable UI physics mode
  function enableUIPhysics() {
    if (uiPhysicsEnabled) return;
    uiPhysicsEnabled = true;
    
    // Select only panels with images (tiles and gallery tiles)
    const selectors = [
      '.tile',
      '.gallery-tile'
    ];
    
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;
        
        // Create physics body
        const body = Bodies.rectangle(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
          rect.width,
          rect.height,
          {
            isStatic: false,
            restitution: 0.6,
            friction: 0.2,
            density: 0.002
          }
        );
        
        World.add(world, body);
        
        // Store original position
        const originalStyle = {
          position: el.style.position,
          left: el.style.left,
          top: el.style.top,
          transform: el.style.transform
        };
        
        // Make element absolute positioned
        el.style.position = 'fixed';
        el.style.zIndex = '1000';
        
        uiElements.push({ element: el, body: body, originalStyle: originalStyle });
      });
    });
  }
  
  // Track mouse position
  document.addEventListener('mousemove', (e) => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
  });
  
  // Animation loop with magnetic effect
  function animate() {
    Engine.update(engine, 1000 / 60);
    
    // Update regular drops
    drops.forEach(drop => {
      const pos = drop.body.position;
      const angle = drop.body.angle;
      
      // Calculate distance to cursor
      const dx = mousePos.x - pos.x;
      const dy = mousePos.y - pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Apply magnetic force if within radius
      if (distance < MAGNET_RADIUS && distance > 0) {
        const forceMagnitude = MAGNET_STRENGTH * (1 - distance / MAGNET_RADIUS);
        const forceX = (dx / distance) * forceMagnitude;
        const forceY = (dy / distance) * forceMagnitude;
        
        Body.applyForce(drop.body, drop.body.position, { x: forceX, y: forceY });
      }
      
      drop.element.style.left = `${pos.x - drop.element.offsetWidth / 2}px`;
      drop.element.style.top = `${pos.y - drop.element.offsetHeight / 2}px`;
      drop.element.style.transform = `rotate(${angle}rad)`;
      
      // Position nametag above the milk
      if (drop.nametag) {
        drop.nametag.style.left = `${pos.x}px`;
        drop.nametag.style.top = `${pos.y - drop.element.offsetHeight / 2 - 16}px`;
        drop.nametag.style.transform = `translateX(-50%)`;
      }
    });
    
    // Update named drops
    namedDrops.forEach(drop => {
      const pos = drop.body.position;
      const angle = drop.body.angle;
      
      // Apply magnetic force
      const dx = mousePos.x - pos.x;
      const dy = mousePos.y - pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < MAGNET_RADIUS && distance > 0) {
        const forceMagnitude = MAGNET_STRENGTH * (1 - distance / MAGNET_RADIUS);
        const forceX = (dx / distance) * forceMagnitude;
        const forceY = (dy / distance) * forceMagnitude;
        
        Body.applyForce(drop.body, drop.body.position, { x: forceX, y: forceY });
      }
      
      drop.element.style.left = `${pos.x - drop.element.offsetWidth / 2}px`;
      drop.element.style.top = `${pos.y - drop.element.offsetHeight / 2}px`;
      drop.element.style.transform = `rotate(${angle}rad)`;
      
      // Position nametag above the milk
      drop.nametag.style.left = `${pos.x}px`;
      drop.nametag.style.top = `${pos.y - drop.element.offsetHeight / 2 - 18}px`;
      drop.nametag.style.transform = `translateX(-50%)`;
    });
    
    // Update UI elements if physics enabled
    if (uiPhysicsEnabled) {
      uiElements.forEach(item => {
        const pos = item.body.position;
        const angle = item.body.angle;
        
        item.element.style.left = `${pos.x - item.element.offsetWidth / 2}px`;
        item.element.style.top = `${pos.y - item.element.offsetHeight / 2}px`;
        item.element.style.transform = `rotate(${angle}rad)`;
      });
    }
    
    // Update chaos Jeffs
    if (chaosMode) {
      chaosJeffs.forEach(jeff => {
        const pos = jeff.body.position;
        const angle = jeff.body.angle;
        
        jeff.element.style.left = `${pos.x - jeff.element.offsetWidth / 2}px`;
        jeff.element.style.top = `${pos.y - jeff.element.offsetHeight / 2}px`;
        jeff.element.style.transform = `rotate(${angle}rad)`;
      });
    }
    
    requestAnimationFrame(animate);
  }
  
  // Spawn drops periodically
  setInterval(() => {
    if (drops.length < MAX_DROPS) {
      createMilkDrop();
    }
  }, 150);
  
  // Initial drops
  for (let i = 0; i < 20; i++) {
    setTimeout(createMilkDrop, i * 80);
  }
  
  let chaosMode = false;
  let chaosJeffs = [];
  
  function createChaosJeff() {
    const size = 40 + Math.random() * 100;
    const x = Math.random() * window.innerWidth;
    const y = -100 - Math.random() * 200;
    
    const body = Bodies.rectangle(x, y, size, size, {
      restitution: 0.8,
      friction: 0.1,
      density: 0.003,
      angle: Math.random() * Math.PI * 2
    });
    
    World.add(world, body);
    
    const jeff = document.createElement('img');
    jeff.src = 'assets/milk.png';
    jeff.style.cssText = `
      position: fixed;
      width: ${size}px;
      height: ${size}px;
      pointer-events: none;
      z-index: 9999;
      filter: hue-rotate(${Math.random() * 360}deg) saturate(${100 + Math.random() * 200}%);
    `;
    
    document.body.appendChild(jeff);
    chaosJeffs.push({ element: jeff, body: body });
  }
  
  function activateChaosMode() {
    if (chaosMode) return;
    chaosMode = true;
    
    // Add glitch effect to Jeff
    const jeffImage = document.querySelector('.guide-image');
    if (jeffImage) {
      jeffImage.style.animation = 'glitch 0.3s infinite';
    }
    
    // Add chaos stylesheet
    const chaosStyle = document.createElement('style');
    chaosStyle.id = 'chaos-style';
    chaosStyle.textContent = `
      @keyframes shake {
        0%, 100% { transform: translate(0, 0) rotate(0deg); }
        10% { transform: translate(-5px, -5px) rotate(-1deg); }
        20% { transform: translate(5px, 5px) rotate(1deg); }
        30% { transform: translate(-5px, 5px) rotate(-1deg); }
        40% { transform: translate(5px, -5px) rotate(1deg); }
        50% { transform: translate(-5px, 0) rotate(-1deg); }
        60% { transform: translate(5px, 0) rotate(1deg); }
        70% { transform: translate(0, -5px) rotate(-1deg); }
        80% { transform: translate(0, 5px) rotate(1deg); }
        90% { transform: translate(-5px, -5px) rotate(-1deg); }
      }
      
      @keyframes glitch {
        0% { transform: translate(0); filter: hue-rotate(0deg); }
        10% { transform: translate(-5px, 5px); filter: hue-rotate(90deg); }
        20% { transform: translate(5px, -5px); filter: hue-rotate(180deg); }
        30% { transform: translate(-5px, -5px); filter: hue-rotate(270deg); }
        40% { transform: translate(5px, 5px); filter: hue-rotate(0deg); }
        50% { transform: translate(0); filter: hue-rotate(180deg); }
        60% { transform: translate(-5px, 0); filter: hue-rotate(90deg); }
        70% { transform: translate(5px, 0); filter: hue-rotate(270deg); }
        80% { transform: translate(0, -5px); filter: hue-rotate(180deg); }
        90% { transform: translate(0, 5px); filter: hue-rotate(0deg); }
        100% { transform: translate(0); filter: hue-rotate(360deg); }
      }
      
      @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
      }
      
      body.chaos-mode {
        animation: shake 0.5s infinite, rainbow 2s infinite;
      }
      
      body.chaos-mode * {
        animation: shake 0.3s infinite;
      }
    `;
    document.head.appendChild(chaosStyle);
    
    // Add chaos class to body
    document.body.classList.add('chaos-mode');
    
    // Spawn tons of Jeffs
    const spawnInterval = setInterval(() => {
      if (chaosMode) {
        for (let i = 0; i < 5; i++) {
          createChaosJeff();
        }
      }
    }, 100);
    
    // Change background colors rapidly
    let hue = 0;
    const colorInterval = setInterval(() => {
      if (chaosMode) {
        hue = (hue + 10) % 360;
        document.body.style.filter = `hue-rotate(${hue}deg)`;
      }
    }, 50);
    
    // End chaos after 30 seconds
    setTimeout(() => {
      chaosMode = false;
      clearInterval(spawnInterval);
      clearInterval(colorInterval);
      
      // Clean up
      document.body.classList.remove('chaos-mode');
      document.body.style.filter = '';
      const chaosStyleEl = document.getElementById('chaos-style');
      if (chaosStyleEl) chaosStyleEl.remove();
      
      if (jeffImage) {
        jeffImage.style.animation = 'bounce 2s ease-in-out infinite';
      }
      
      // Remove all chaos Jeffs with fade out
      chaosJeffs.forEach(jeff => {
        jeff.element.style.transition = 'opacity 2s';
        jeff.element.style.opacity = '0';
        setTimeout(() => {
          World.remove(world, jeff.body);
          jeff.element.remove();
        }, 2000);
      });
      chaosJeffs = [];
      
      // Show completion message
      const guideText = document.getElementById('guideText');
      const guideOptions = document.getElementById('guideOptions');
      if (guideText) {
        guideText.textContent = "Whew! That was INTENSE! 😵‍💫 The chaos has ended. Everything is back to normal... or is it? 🥛✨";
        guideOptions.innerHTML = '';
      }
    }, 30000);
  }
  
  // Animation loop
  function animate() {
    Engine.update(engine, 1000 / 60);
    
    // Update regular drops
    drops.forEach(drop => {
      const pos = drop.body.position;
      const angle = drop.body.angle;
      
      // Calculate distance to cursor
      const dx = mousePos.x - pos.x;
      const dy = mousePos.y - pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Apply magnetic force if within radius
      if (distance < MAGNET_RADIUS && distance > 0) {
        const forceMagnitude = MAGNET_STRENGTH * (1 - distance / MAGNET_RADIUS);
        const forceX = (dx / distance) * forceMagnitude;
        const forceY = (dy / distance) * forceMagnitude;
        
        Body.applyForce(drop.body, drop.body.position, { x: forceX, y: forceY });
      }
      
      drop.element.style.left = `${pos.x - drop.element.offsetWidth / 2}px`;
      drop.element.style.top = `${pos.y - drop.element.offsetHeight / 2}px`;
      drop.element.style.transform = `rotate(${angle}rad)`;
      
      // Position nametag above the milk
      if (drop.nametag) {
        drop.nametag.style.left = `${pos.x}px`;
        drop.nametag.style.top = `${pos.y - drop.element.offsetHeight / 2 - 16}px`;
        drop.nametag.style.transform = `translateX(-50%)`;
      }
    });
    
    // Update named drops
    namedDrops.forEach(drop => {
      const pos = drop.body.position;
      const angle = drop.body.angle;
      
      // Apply magnetic force
      const dx = mousePos.x - pos.x;
      const dy = mousePos.y - pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < MAGNET_RADIUS && distance > 0) {
        const forceMagnitude = MAGNET_STRENGTH * (1 - distance / MAGNET_RADIUS);
        const forceX = (dx / distance) * forceMagnitude;
        const forceY = (dy / distance) * forceMagnitude;
        
        Body.applyForce(drop.body, drop.body.position, { x: forceX, y: forceY });
      }
      
      drop.element.style.left = `${pos.x - drop.element.offsetWidth / 2}px`;
      drop.element.style.top = `${pos.y - drop.element.offsetHeight / 2}px`;
      drop.element.style.transform = `rotate(${angle}rad)`;
      
      // Position nametag above the milk
      drop.nametag.style.left = `${pos.x}px`;
      drop.nametag.style.top = `${pos.y - drop.element.offsetHeight / 2 - 18}px`;
      drop.nametag.style.transform = `translateX(-50%)`;
    });
    
    // Update UI elements if physics enabled
    if (uiPhysicsEnabled) {
      uiElements.forEach(item => {
        const pos = item.body.position;
        const angle = item.body.angle;
        
        item.element.style.left = `${pos.x - item.element.offsetWidth / 2}px`;
        item.element.style.top = `${pos.y - item.element.offsetHeight / 2}px`;
        item.element.style.transform = `rotate(${angle}rad)`;
      });
    }
    
    // Update chaos Jeffs
    if (chaosMode) {
      chaosJeffs.forEach(jeff => {
        const pos = jeff.body.position;
        const angle = jeff.body.angle;
        
        jeff.element.style.left = `${pos.x - jeff.element.offsetWidth / 2}px`;
        jeff.element.style.top = `${pos.y - jeff.element.offsetHeight / 2}px`;
        jeff.element.style.transform = `rotate(${angle}rad)`;
      });
    }
    
    requestAnimationFrame(animate);
  }
  
  // Spawn drops periodically
  setInterval(() => {
    if (drops.length < MAX_DROPS) {
      createMilkDrop();
    }
  }, 150);
  
  // Initial drops
  for (let i = 0; i < 20; i++) {
    setTimeout(createMilkDrop, i * 80);
  }
  
  animate();
  
  // Handle window resize and scroll
  let resizeTimeout;
  function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Update floor and walls
      Body.setPosition(floorBody, { x: window.innerWidth / 2, y: window.innerHeight + 10 });
      Body.setVertices(floorBody, Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 10, window.innerWidth * 2, 20).vertices);
      
      Body.setPosition(rightWall, { x: window.innerWidth + 10, y: window.innerHeight / 2 });
      
      // Recreate element bodies
      createElementBodies();
    }, 250);
  }
  
  window.addEventListener('resize', handleResize);
  window.addEventListener('scroll', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(createElementBodies, 100);
  });
  
  // Listen for UI physics activation
  window.addEventListener('activateUIPhysics', () => {
    enableUIPhysics();
  });
  
  // Listen for named milk creation events
  window.addEventListener('createNamedMilk', (e) => {
    createNamedMilkDrop(e.detail.name);
  });
  
  // Restore named milks from localStorage on load
  const savedNamedMilks = JSON.parse(localStorage.getItem('namedMilks') || '[]');
  savedNamedMilks.forEach((name, index) => {
    setTimeout(() => createNamedMilkDrop(name), index * 500);
  });
  
  // Listen for chaos mode activation
  window.addEventListener('activateChaosMode', () => {
    activateChaosMode();
  });
})();
