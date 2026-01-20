(function() {
  const milkRain = document.getElementById('milkRain');
  const MAX_DROPS = 100;
  const DESPAWN_TIME = 15000; // 15 seconds
  const MAGNET_STRENGTH = 0.008;
  const MAGNET_RADIUS = 450;
  let drops = [];
  let engine, world, runner;
  let mousePos = { x: 0, y: 0 };
  let elementBodies = [];
  
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
    }
  }
  
  function createMilkDrop() {
    if (drops.length >= MAX_DROPS) return;
    
    const size = 20 + Math.random() * 24;
    const x = Math.random() * window.innerWidth;
    
    // Create Matter.js body
    const body = Bodies.circle(x, -50, size / 2, {
      restitution: 0.4,
      friction: 0.3,
      density: 0.001,
      angle: Math.random() * Math.PI * 2
    });
    
    World.add(world, body);
    
    // Create DOM element
    const drop = document.createElement('div');
    drop.className = 'milk-drop';
    drop.style.width = `${size}px`;
    drop.style.height = `${size}px`;
    drop.style.opacity = 0.3 + Math.random() * 0.3;
    
    milkRain.appendChild(drop);
    
    const dropData = { 
      element: drop, 
      body: body,
      createdAt: Date.now()
    };
    
    drops.push(dropData);
    
    // Schedule despawn
    setTimeout(() => {
      // Fade out
      drop.style.transition = 'opacity 1s';
      drop.style.opacity = '0';
      setTimeout(() => removeDrop(dropData), 1000);
    }, DESPAWN_TIME);
  }
  
  // Track mouse position
  document.addEventListener('mousemove', (e) => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
  });
  
  // Animation loop with magnetic effect
  function animate() {
    Engine.update(engine, 1000 / 60);
    
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
    });
    
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
})();
