// Game variables
let canvas, ctx;
let peer;
let connections = {};
let players = {};
let myId = '';
const playerSize = 30;
const playerSpeed = 5;
const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff', '#ff8800'];
const SYNC_INTERVAL = 3000; // Sync all player states every 3 seconds

// Chat variables
let isChatOpen = false;
const chatHistory = [];
const MAX_CHAT_HISTORY = 50;

// Initialize the game
function init() {
    // Set up canvas
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Initialize player
    myId = 'player_' + Math.floor(Math.random() * 10000);
    players[myId] = {
        x: Math.random() * (canvas.width - playerSize),
        y: Math.random() * (canvas.height - playerSize),
        color: colors[Math.floor(Math.random() * colors.length)],
        id: myId
    };

    document.getElementById('my-id').textContent = myId;
    
    // Set up PeerJS
    setupPeer();
    
    // Set up input handling
    setupControls();

    // Set up chat functionality
    setupChat();
    
    // Set up periodic full state synchronization
    setInterval(syncFullState, SYNC_INTERVAL);
    
    // Start game loop
    gameLoop();
}

// Resize canvas to fit the window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - document.getElementById('connection-panel').offsetHeight;
}

// Set up P2P connections
function setupPeer() {
    peer = new Peer(myId);
    
    peer.on('open', (id) => {
        console.log('My peer ID is: ' + id);
        document.getElementById('my-id').textContent = id;
    });
    
    peer.on('connection', (conn) => {
        handleConnection(conn);
    });
    
    peer.on('error', (err) => {
        console.error('PeerJS error:', err);
    });
    
    document.getElementById('connect-btn').addEventListener('click', connectToPeer);
}

// Connect to another peer
function connectToPeer() {
    const peerId = document.getElementById('peer-id').value.trim();
    
    if (peerId && peerId !== myId && !connections[peerId]) {
        const conn = peer.connect(peerId);
        handleConnection(conn);
    } else {
        console.log('Invalid peer ID or already connected');
    }
}

// Handle new connections
function handleConnection(conn) {
    connections[conn.peer] = conn;
    
    // Update UI
    const peerList = document.getElementById('peer-list');
    const peerItem = document.createElement('li');
    peerItem.textContent = conn.peer;
    peerItem.id = 'peer-' + conn.peer;
    peerList.appendChild(peerItem);
    
    // Send initial state
    conn.on('open', () => {
        console.log('Connected to: ' + conn.peer);
        
        // Share my player data and chat history
        conn.send({
            type: 'init',
            players: players,
            chatHistory: chatHistory
        });
        
        // Send my player list to the new connection
        broadcastNewPlayer(conn.peer);

        // Add system message for new player joined
        addChatMessage('System', `${conn.peer} has joined the game`, true);
    });
    
    // Handle received data
    conn.on('data', (data) => {
        if (data.type === 'init') {
            // Add new players to my game
            for (let id in data.players) {
                if (id !== myId && !players[id]) {
                    players[id] = data.players[id];
                }
            }
            
            // Sync chat history
            if (data.chatHistory && Array.isArray(data.chatHistory)) {
                // Merge chat histories
                data.chatHistory.forEach(msg => {
                    if (!chatHistory.some(m => 
                        m.sender === msg.sender && 
                        m.message === msg.message && 
                        m.timestamp === msg.timestamp
                    )) {
                        chatHistory.push(msg);
                    }
                });
                
                // Sort by timestamp and limit size
                chatHistory.sort((a, b) => a.timestamp - b.timestamp);
                if (chatHistory.length > MAX_CHAT_HISTORY) {
                    chatHistory.splice(0, chatHistory.length - MAX_CHAT_HISTORY);
                }
                
                // Update chat display
                updateChatDisplay();
            }
        } else if (data.type === 'update') {
            // Update player position
            if (data.player.id !== myId) {
                players[data.player.id] = data.player;
            }
        } else if (data.type === 'new-player') {
            // Add a new player that someone else connected to
            if (data.player.id !== myId && !players[data.player.id]) {
                players[data.player.id] = data.player;
            }
        } else if (data.type === 'chat') {
            // Add received chat message
            if (!chatHistory.some(m => 
                m.sender === data.sender && 
                m.message === data.message && 
                m.timestamp === data.timestamp
            )) {
                chatHistory.push({
                    sender: data.sender,
                    message: data.message,
                    timestamp: data.timestamp
                });
                
                // Sort and limit chat history
                chatHistory.sort((a, b) => a.timestamp - b.timestamp);
                if (chatHistory.length > MAX_CHAT_HISTORY) {
                    chatHistory.splice(0, chatHistory.length - MAX_CHAT_HISTORY);
                }
                
                // Update chat display
                updateChatDisplay();
            }
        } else if (data.type === 'full-sync') {
            // Update all player positions from full sync
            for (let id in data.players) {
                if (id !== myId) { // Don't override our own position
                    players[id] = data.players[id];
                }
            }
            
            // Sync chat history
            if (data.chatHistory && Array.isArray(data.chatHistory)) {
                // Merge chat histories
                data.chatHistory.forEach(msg => {
                    if (!chatHistory.some(m => 
                        m.sender === msg.sender && 
                        m.message === msg.message && 
                        m.timestamp === msg.timestamp
                    )) {
                        chatHistory.push(msg);
                    }
                });
                
                // Sort by timestamp and limit size
                chatHistory.sort((a, b) => a.timestamp - b.timestamp);
                if (chatHistory.length > MAX_CHAT_HISTORY) {
                    chatHistory.splice(0, chatHistory.length - MAX_CHAT_HISTORY);
                }
                
                // Update chat display
                updateChatDisplay();
            }
        }
    });
    
    // Handle closed connections
    conn.on('close', () => {
        console.log('Connection closed: ' + conn.peer);
        delete connections[conn.peer];
        delete players[conn.peer];
        
        // Update UI
        const peerItem = document.getElementById('peer-' + conn.peer);
        if (peerItem) {
            peerItem.remove();
        }
        
        // Add system message for player left
        addChatMessage('System', `${conn.peer} has left the game`, true);
    });
}

// Broadcast a new player to all connected peers
function broadcastNewPlayer(newPeerId) {
    for (let id in connections) {
        if (id !== newPeerId) {
            connections[id].send({
                type: 'new-player',
                player: players[newPeerId]
            });
        }
    }
}

// Broadcast player update to all peers
function broadcastPlayerUpdate() {
    const playerData = players[myId];
    
    for (let id in connections) {
        connections[id].send({
            type: 'update',
            player: playerData
        });
    }
}

// Sync complete game state to ensure consistency across all peers
function syncFullState() {
    // Only initiate sync if we have connections
    if (Object.keys(connections).length > 0) {
        for (let id in connections) {
            connections[id].send({
                type: 'full-sync',
                players: players,
                chatHistory: chatHistory
            });
        }
        console.log('Full state sync sent to all peers');
    }
}

// Setup chat functionality
function setupChat() {
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatHint = document.getElementById('chat-hint');
    
    // Setup T key to toggle chat
    window.addEventListener('keydown', (e) => {
        if (e.key === 't' && !isChatOpen) {
            e.preventDefault();
            openChat();
        } else if (e.key === 'Escape' && isChatOpen) {
            closeChat();
        }
    });
    
    // Send button click
    chatSendBtn.addEventListener('click', sendChatMessage);
    
    // Enter key in chat input
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
    
    function openChat() {
        isChatOpen = true;
        chatContainer.classList.remove('hidden');
        chatHint.style.display = 'none';
        chatInput.focus();
    }
    
    function closeChat() {
        isChatOpen = false;
        chatContainer.classList.add('hidden');
        chatHint.style.display = 'block';
        chatInput.value = '';
    }
    
    // Initial chat display update
    updateChatDisplay();
}

// Send a chat message
function sendChatMessage() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value.trim();
    
    if (message) {
        // Add message to local chat history
        addChatMessage(myId, message);
        
        // Clear input
        chatInput.value = '';
        chatInput.focus();
    }
}

// Add a chat message to history and broadcast to peers
function addChatMessage(sender, message, isSystem = false) {
    const timestamp = Date.now();
    
    // Create chat message object
    const chatMessage = {
        sender: sender,
        message: message,
        timestamp: timestamp,
        isSystem: isSystem
    };
    
    // Add to local history
    chatHistory.push(chatMessage);
    
    // Sort and limit chat history
    chatHistory.sort((a, b) => a.timestamp - b.timestamp);
    if (chatHistory.length > MAX_CHAT_HISTORY) {
        chatHistory.splice(0, chatHistory.length - MAX_CHAT_HISTORY);
    }
    
    // Update chat display
    updateChatDisplay();
    
    // Broadcast to all peers (except system messages)
    if (!isSystem) {
        for (let id in connections) {
            connections[id].send({
                type: 'chat',
                sender: sender,
                message: message,
                timestamp: timestamp
            });
        }
    }
}

// Update the chat display with current history
function updateChatDisplay() {
    const chatMessages = document.getElementById('chat-messages');
    
    // Clear current messages
    chatMessages.innerHTML = '';
    
    // Add all messages
    chatHistory.forEach(msg => {
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        
        if (msg.isSystem) {
            // System message styling
            messageElement.innerHTML = `<span class="chat-system">${msg.message}</span>`;
        } else {
            // Get player color if available
            let senderColor = '#ffffff';
            if (players[msg.sender] && players[msg.sender].color) {
                senderColor = players[msg.sender].color;
            }
            
            messageElement.innerHTML = `<span class="chat-sender" style="color:${senderColor}">${msg.sender}:</span> ${msg.message}`;
        }
        
        chatMessages.appendChild(messageElement);
    });
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Setup keyboard controls
function setupControls() {
    const keys = {};
    
    window.addEventListener('keydown', (e) => {
        // Only handle movement keys if chat is not open
        if (!isChatOpen || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown' && 
                           e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && 
                           e.key !== 'w' && e.key !== 'a' && e.key !== 's' && e.key !== 'd')) {
            keys[e.key] = true;
        }
    });
    
    window.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });
    
    function movePlayer() {
        // Only move if chat is not open
        if (!isChatOpen) {
            let moved = false;
            const player = players[myId];
            
            if (keys['ArrowUp'] || keys['w']) {
                player.y = Math.max(0, player.y - playerSpeed);
                moved = true;
            }
            if (keys['ArrowDown'] || keys['s']) {
                player.y = Math.min(canvas.height - playerSize, player.y + playerSpeed);
                moved = true;
            }
            if (keys['ArrowLeft'] || keys['a']) {
                player.x = Math.max(0, player.x - playerSpeed);
                moved = true;
            }
            if (keys['ArrowRight'] || keys['d']) {
                player.x = Math.min(canvas.width - playerSize, player.x + playerSpeed);
                moved = true;
            }
            
            if (moved) {
                broadcastPlayerUpdate();
            }
        }
        
        requestAnimationFrame(movePlayer);
    }
    
    movePlayer();
}

// Game rendering loop
function gameLoop() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw all players
    for (let id in players) {
        const player = players[id];
        
        // Make sure player has all required properties before rendering
        if (player && player.x !== undefined && player.y !== undefined && player.color) {
            ctx.fillStyle = player.color;
            ctx.fillRect(player.x, player.y, playerSize, playerSize);
            
            // Draw player ID above the cube
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(id, player.x + playerSize / 2, player.y - 5);
        }
    }
    
    // Show player count in corner
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Players: ' + Object.keys(players).length, 10, 20);
    
    // Loop
    requestAnimationFrame(gameLoop);
}

// Start the game when the window loads
window.addEventListener('load', init);
