// Game variables
let canvas, ctx;
let peer;
let connections = {};
let players = {};
let myId = '';
const playerSize = 30;
const playerSpeed = 5;
const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff', '#ff8800'];

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
        
        // Share my player data
        conn.send({
            type: 'init',
            players: players
        });
        
        // Send my player list to the new connection
        broadcastNewPlayer(conn.peer);
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
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, playerSize, playerSize);
        
        // Draw player ID above the cube
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(id, player.x + playerSize / 2, player.y - 5);
    }
    
    // Loop
    requestAnimationFrame(gameLoop);
}

// Start the game when the window loads
window.addEventListener('load', init);
