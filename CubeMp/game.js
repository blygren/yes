// Wait for DOM to be fully loaded before executing any code
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const gameContainer = document.getElementById('game-container');
    const chatInput = document.getElementById('chat-input');
    const myIdSpan = document.getElementById('my-id');
    const peerIdInput = document.getElementById('peer-id-input');
    const connectBtn = document.getElementById('connect-btn');
    const statusSpan = document.getElementById('status');

    // --- Matter.js Setup ---
    const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;
    const engine = Engine.create();
    engine.world.gravity.y = 1;
    const world = engine.world;
    
    // Create renderer
    const render = Render.create({
        element: gameContainer,
        engine: engine,
        options: {
            width: 800,
            height: 600,
            wireframes: false,
            background: '#1a1a1a'
        }
    });
    Render.run(render);
    Runner.run(Runner.create(), engine);

    // --- Game Objects ---
    const ground = Bodies.rectangle(400, 600, 810, 60, { 
        isStatic: true,
        render: { fillStyle: '#333' }
    });
    
    const leftWall = Bodies.rectangle(0, 300, 20, 600, { 
        isStatic: true,
        render: { fillStyle: '#333' }
    });
    
    const rightWall = Bodies.rectangle(800, 300, 20, 600, { 
        isStatic: true,
        render: { fillStyle: '#333' }
    });
    
    // Player colors for up to 4 players
    const playerColors = ['#4287f5', '#f542a7', '#42f554', '#f5d742'];
    
    // Random player color for local player
    const myColorIndex = Math.floor(Math.random() * playerColors.length);
    const myColor = playerColors[myColorIndex];
    
    const player = Bodies.rectangle(400, 500, 40, 40, { 
        restitution: 0.1,
        friction: 0.01,
        render: { fillStyle: myColor }
    });
    
    // Add all static objects to world
    World.add(world, [ground, leftWall, rightWall, player]);
    
    // Object to store connected friends
    const friends = {};
    
    // --- Chat System ---
    let chatActive = false;
    const speechBubbles = [];
    
    // Create and display speech bubble
    function displaySpeechBubble(body, message) {
        // Remove existing bubble for this body
        for (let i = speechBubbles.length - 1; i >= 0; i--) {
            if (speechBubbles[i].body === body) {
                if (speechBubbles[i].element && speechBubbles[i].element.parentNode) {
                    speechBubbles[i].element.remove();
                }
                speechBubbles.splice(i, 1);
                break;
            }
        }
        
        // Create new bubble
        const bubble = document.createElement('div');
        bubble.className = 'speech-bubble';
        bubble.textContent = message;
        gameContainer.appendChild(bubble);
        
        // Position bubble above body
        const pos = body.position;
        bubble.style.left = `${pos.x}px`;
        bubble.style.top = `${pos.y - 30}px`;
        
        // Store reference
        speechBubbles.push({
            element: bubble,
            body: body,
            timestamp: Date.now()
        });
        
        // Fade out after 3 seconds
        setTimeout(() => {
            if (bubble && bubble.parentNode) {
                bubble.style.opacity = '0';
                setTimeout(() => {
                    if (bubble && bubble.parentNode) {
                        bubble.remove();
                    }
                }, 500);
            }
        }, 3000);
    }
    
    // Update speech bubble positions
    function updateBubblePositions() {
        const now = Date.now();
        
        // Remove bubbles that are too old (4+ seconds)
        for (let i = speechBubbles.length - 1; i >= 0; i--) {
            const bubbleData = speechBubbles[i];
            
            // Remove old bubbles
            if (now - bubbleData.timestamp > 4000) {
                if (bubbleData.element && bubbleData.element.parentNode) {
                    bubbleData.element.remove();
                }
                speechBubbles.splice(i, 1);
                continue;
            }
            
            // Update positions for remaining bubbles
            if (bubbleData.body && bubbleData.element && bubbleData.element.parentNode) {
                const pos = bubbleData.body.position;
                bubbleData.element.style.left = `${pos.x}px`;
                bubbleData.element.style.top = `${pos.y - 30}px`;
            }
        }
        
        requestAnimationFrame(updateBubblePositions);
    }
    updateBubblePositions();
    
    // --- Controls ---
    const keys = {};
    let canJump = true;
    
    // Keyboard handling
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Enter') {
            e.preventDefault();
            if (chatActive) {
                // Send message
                const message = chatInput.value.trim();
                if (message) {
                    displaySpeechBubble(player, message);
                    // Send message to all connections
                    broadcastToAll({
                        type: 'chat',
                        message: message,
                        fromId: peer.id
                    });
                }
                chatInput.value = '';
                chatInput.style.display = 'none';
                chatActive = false;
            } else {
                // Open chat
                chatInput.style.display = 'block';
                chatInput.focus();
                chatActive = true;
            }
        } else if (e.code === 'Escape' && chatActive) {
            // Cancel chat
            chatInput.style.display = 'none';
            chatActive = false;
        } else if (!chatActive) {
            // Movement keys
            keys[e.code] = true;
        }
    });
    
    window.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });
    
    // Handle jumping
    Events.on(engine, 'collisionStart', (event) => {
        const pairs = event.pairs;
        for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i];
            if (pair.bodyA === player || pair.bodyB === player) {
                if (Math.abs(pair.collision.normal.y) > 0.5) {
                    canJump = true;
                }
            }
        }
    });
    
    // Movement logic
    Events.on(engine, 'beforeUpdate', () => {
        const speed = 5;
        if (keys['KeyA'] || keys['ArrowLeft']) {
            Body.setVelocity(player, { x: -speed, y: player.velocity.y });
        }
        if (keys['KeyD'] || keys['ArrowRight']) {
            Body.setVelocity(player, { x: speed, y: player.velocity.y });
        }
        if ((keys['Space'] || keys['KeyW'] || keys['ArrowUp']) && canJump) {
            Body.setVelocity(player, { x: player.velocity.x, y: -10 });
            canJump = false;
        }
    });
    
    // --- Multiplayer with PeerJS ---
    const connections = {};
    let peer;
    
    // Function to broadcast to all connections
    function broadcastToAll(data) {
        Object.values(connections).forEach(conn => {
            if (conn && conn.open) {
                conn.send(data);
            }
        });
    }
    
    try {
        // Initialize PeerJS with random ID
        peer = new Peer();
        
        peer.on('open', (id) => {
            myIdSpan.textContent = id;
            statusSpan.textContent = "Ready to connect";
        });
        
        peer.on('error', (err) => {
            statusSpan.textContent = `Error: ${err.type}`;
            console.error('PeerJS error:', err);
        });
        
        // Connect button logic
        connectBtn.addEventListener('click', () => {
            const peerId = peerIdInput.value.trim();
            if (peerId && peerId !== peer.id) { // Don't connect to yourself
                statusSpan.textContent = "Connecting...";
                const conn = peer.connect(peerId);
                setupConnection(conn);
            }
        });
        
        // Handle incoming connections
        peer.on('connection', (conn) => {
            statusSpan.textContent = `Incoming connection from ${conn.peer}...`;
            setupConnection(conn);
        });
        
        // Set up connection events
        function setupConnection(connection) {
            const peerId = connection.peer;
            
            connection.on('open', () => {
                connections[peerId] = connection;
                updateStatus();
                
                // Send initial data including our color
                connection.send({
                    type: 'init',
                    colorIndex: myColorIndex,
                    fromId: peer.id
                });
                
                // Create friend cube if it doesn't exist
                if (!friends[peerId]) {
                    // Default color (will be updated when they send their color)
                    const friendColor = '#f5a142';
                    const friendCube = Bodies.rectangle(
                        200 + Math.random() * 400, 
                        300 + Math.random() * 100, 
                        40, 40, 
                        { 
                            isStatic: false,
                            render: { fillStyle: friendColor }
                        }
                    );
                    
                    friends[peerId] = {
                        body: friendCube,
                        color: friendColor
                    };
                    
                    World.add(world, friendCube);
                }
            });
            
            connection.on('data', (data) => {
                handlePeerData(peerId, data);
            });
            
            connection.on('close', () => {
                // Remove the friend's cube
                if (friends[peerId]) {
                    World.remove(world, friends[peerId].body);
                    delete friends[peerId];
                }
                
                // Remove the connection
                delete connections[peerId];
                updateStatus();
            });
        }
        
        // Handle data from peers
        function handlePeerData(peerId, data) {
            // Make sure the friend exists
            if (!friends[peerId] && data.type !== 'init') {
                return;
            }
            
            // Handle different message types
            switch (data.type) {
                case 'init':
                    // Set friend's color based on their info
                    if (friends[peerId]) {
                        const colorIndex = data.colorIndex;
                        const friendColor = playerColors[colorIndex] || '#f5a142';
                        friends[peerId].body.render.fillStyle = friendColor;
                        friends[peerId].color = friendColor;
                    }
                    break;
                    
                case 'position':
                    if (friends[peerId]) {
                        Body.setPosition(friends[peerId].body, data.position);
                        Body.setVelocity(friends[peerId].body, data.velocity);
                    }
                    break;
                    
                case 'chat':
                    if (friends[peerId]) {
                        displaySpeechBubble(friends[peerId].body, data.message);
                    }
                    break;
            }
        }
        
        // Update status message showing connection count
        function updateStatus() {
            const connCount = Object.keys(connections).length;
            statusSpan.textContent = `Connected to ${connCount} player${connCount !== 1 ? 's' : ''}`;
        }
        
        // Send position updates
        setInterval(() => {
            if (Object.keys(connections).length > 0) {
                broadcastToAll({
                    type: 'position',
                    position: player.position,
                    velocity: player.velocity,
                    fromId: peer.id
                });
            }
        }, 50);
        
    } catch (error) {
        console.error("Error initializing PeerJS:", error);
        statusSpan.textContent = "Error initializing connection";
    }
});
