// Game variables
let canvas, ctx;
let peer;
let connections = {};
let players = {};
let myId = '';
const playerSize = 30;
const playerSpeed = 5;
const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff', '#ff8800'];
const MAX_PLAYERS = 4; // Maximum number of allowed players
const SYNC_INTERVAL = 3000; // Sync all player states every 3 seconds

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
    
    // Start game loop
    gameLoop();
    
    // Set up periodic full state synchronization
    setInterval(syncFullState, SYNC_INTERVAL);
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
        // Check if we already have maximum players
        if (Object.keys(connections).length >= MAX_PLAYERS - 1) {
            console.log('Maximum players reached, rejecting connection');
            conn.on('open', () => {
                conn.send({
                    type: 'error',
                    message: 'Game is full (max ' + MAX_PLAYERS + ' players)'
                });
                conn.close();
            });
            return;
        }
        
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
    
    // Check if we've reached max player limit
    if (Object.keys(connections).length >= MAX_PLAYERS - 1) {
        alert('Cannot connect: Maximum players (' + MAX_PLAYERS + ') reached');
        return;
    }
    
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
    
    // Update player count display
    updatePlayerCountDisplay();
    
    // Send initial state
    conn.on('open', () => {
        console.log('Connected to: ' + conn.peer);
        
        // Share my complete player data including all known players
        conn.send({
            type: 'init',
            players: players
        });
        
        // Request their complete player data as well for bi-directional sync
        conn.send({
            type: 'request-players'
        });
        
        // Send my player list to the new connection
        broadcastNewPlayer(conn.peer);
    });
    
    // Handle received data
    conn.on('data', (data) => {
        if (data.type === 'init') {
            // Add new players to my game
            for (let id in data.players) {
                if (id !== myId) {
                    // Only update if player doesn't exist or it's a position update
                    if (!players[id] || (data.players[id].x !== undefined && data.players[id].y !== undefined)) {
                        players[id] = data.players[id];
                    }
                }
            }
        } else if (data.type === 'full-sync') {
            // Update all player positions from full sync
            for (let id in data.players) {
                if (id !== myId) { // Don't override our own position
                    players[id] = data.players[id];
                }
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
                updatePlayerCountDisplay();
            }
        } else if (data.type === 'request-players') {
            // Someone is requesting our complete player list
            conn.send({
                type: 'init',
                players: players
            });
        } else if (data.type === 'error') {
            // Display error messages from peers
            alert('Connection error: ' + data.message);
            delete connections[conn.peer];
            updatePlayerCountDisplay();
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
        
        updatePlayerCountDisplay();
        
        // Notify other peers that this player has disconnected
        for (let id in connections) {
            connections[id].send({
                type: 'player-disconnect',
                playerId: conn.peer
            });
        }
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
                players: players
            });
        }
        console.log('Full state sync sent to all peers');
    }
}

// Update the player count display in the UI
function updatePlayerCountDisplay() {
    const playerCount = Object.keys(players).length;
    const playerCountElement = document.getElementById('player-count');
    
    playerCountElement.textContent = 'Players: ' + playerCount + '/' + MAX_PLAYERS;
    
    if (playerCount >= MAX_PLAYERS) {
        playerCountElement.classList.add('full');
    } else {
        playerCountElement.classList.remove('full');
    }
}

// Setup keyboard controls
function setupControls() {
    const keys = {};
    
    window.addEventListener('keydown', (e) => {
        keys[e.key] = true;
    });
    
    window.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });
    
    function movePlayer() {
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
    ctx.fillText('Players: ' + Object.keys(players).length + '/' + MAX_PLAYERS, 10, 20);
    
    // Loop
    requestAnimationFrame(gameLoop);
}

// Start the game when the window loads
window.addEventListener('load', () => {
    init();
    // Initialize player count display
    updatePlayerCountDisplay();
});
