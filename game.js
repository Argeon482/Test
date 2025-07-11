// Multiplayer game state
let gameState = {
    connected: false,
    inGame: false,
    playerId: null,
    playerName: '',
    roomId: null,
    players: [],
    food: null,
    gameRunning: false
};

// Socket.io connection
let socket = null;

// Canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game settings
const GRID_SIZE = 20;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 400;
const GRID_WIDTH = CANVAS_WIDTH / GRID_SIZE;
const GRID_HEIGHT = CANVAS_HEIGHT / GRID_SIZE;

// UI Elements
const nameEntryScreen = document.getElementById('nameEntry');
const gameScreen = document.getElementById('gameScreen');
const playerNameInput = document.getElementById('playerName');
const joinGameBtn = document.getElementById('joinGameBtn');
const playerCountElement = document.getElementById('playerCount');
const roomIdElement = document.getElementById('roomId');
const scoresContainer = document.getElementById('scoresContainer');
const gameOverElement = document.getElementById('gameOver');
const gameEndedElement = document.getElementById('gameEnded');
const finalScoreElement = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');
const newGameBtn = document.getElementById('newGameBtn');
const backToLobbyBtn = document.getElementById('backToLobbyBtn');
const backToLobbyBtn2 = document.getElementById('backToLobbyBtn2');
const gameMessages = document.getElementById('gameMessages');
const winnerInfo = document.getElementById('winnerInfo');
const finalScores = document.getElementById('finalScores');

// Control buttons
const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

// Socket.io connection and event handlers
function connectToServer() {
    socket = io();
    
    socket.on('connect', () => {
        console.log('Connected to server');
        gameState.connected = true;
    });
    
    socket.on('disconnect', () => {
        console.log('Disconnected from server');
        gameState.connected = false;
        showMessage('Disconnected from server', 'error');
    });
    
    socket.on('joinedGame', (data) => {
        gameState.inGame = true;
        gameState.playerId = data.playerId;
        gameState.roomId = data.roomId;
        
        // Show game screen
        nameEntryScreen.style.display = 'none';
        gameScreen.style.display = 'block';
        
        // Update UI
        playerCountElement.textContent = data.playerCount;
        roomIdElement.textContent = data.roomId.substring(0, 8);
        
        showMessage(`Joined game room!`, 'success');
    });
    
    socket.on('gameState', (state) => {
        gameState.players = state.players;
        gameState.food = state.food;
        gameState.gameRunning = state.running;
        
        updateScoreboard();
        draw();
    });
    
    socket.on('playerJoined', (data) => {
        playerCountElement.textContent = data.playerCount;
        showMessage(`${data.playerName} joined the game!`, 'info');
    });
    
    socket.on('playerLeft', (data) => {
        playerCountElement.textContent = data.playerCount;
        showMessage(`${data.playerName} left the game`, 'warning');
    });
    
    socket.on('gameUpdate', (update) => {
        if (update.type === 'playerDied') {
            if (update.playerId === gameState.playerId) {
                showGameOver();
            } else {
                showMessage(`${update.playerName} died!`, 'warning');
            }
        } else if (update.type === 'foodEaten') {
            // Food eaten, new food position will come with next gameState
        }
    });
    
    socket.on('gameEnded', (data) => {
        showGameEnded(data);
    });
    
    socket.on('error', (error) => {
        showMessage(error.message, 'error');
    });
}

// Draw game elements
function draw() {
    // Clear canvas
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    if (!gameState.players || gameState.players.length === 0) {
        // Show waiting message
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Waiting for players...', CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
        return;
    }
    
    // Draw all snakes
    gameState.players.forEach(player => {
        if (!player.alive) return;
        
        player.snake.forEach((segment, index) => {
            let segmentColor = player.color;
            
            // If player hasn't started moving, make them semi-transparent
            if (!player.hasStartedMoving) {
                // Convert color to rgba with transparency
                const rgb = hexToRgb(player.color);
                segmentColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`;
            }
            
            if (index === 0) {
                // Head - brighter version of player color
                ctx.fillStyle = player.hasStartedMoving ? lightenColor(player.color, 20) : segmentColor;
            } else {
                ctx.fillStyle = segmentColor;
            }
            
            ctx.fillRect(
                segment.x * GRID_SIZE + 1,
                segment.y * GRID_SIZE + 1,
                GRID_SIZE - 2,
                GRID_SIZE - 2
            );
            
            // Add shine effect for current player
            if (player.id === gameState.playerId) {
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.fillRect(
                    segment.x * GRID_SIZE + 2,
                    segment.y * GRID_SIZE + 2,
                    GRID_SIZE - 8,
                    GRID_SIZE - 8
                );
            }
        });
        
        // Show "TAP TO START" message for current player if they haven't started
        if (player.id === gameState.playerId && !player.hasStartedMoving) {
            const head = player.snake[0];
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('TAP TO START', head.x * GRID_SIZE + GRID_SIZE/2, head.y * GRID_SIZE - 5);
        }
    });
    
    // Draw food with animation effect
    if (gameState.food) {
        const time = Date.now() * 0.005;
        const pulseSize = Math.sin(time) * 2;
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(
            gameState.food.x * GRID_SIZE + 1 - pulseSize/2,
            gameState.food.y * GRID_SIZE + 1 - pulseSize/2,
            GRID_SIZE - 2 + pulseSize,
            GRID_SIZE - 2 + pulseSize
        );
        
        // Add apple shine
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillRect(
            gameState.food.x * GRID_SIZE + 3,
            gameState.food.y * GRID_SIZE + 3,
            GRID_SIZE - 10,
            GRID_SIZE - 10
        );
    }
}

// Helper function to lighten colors
function lightenColor(color, percent) {
    const num = parseInt(color.replace("#",""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 +
        (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255))
        .toString(16).slice(1);
}

// Helper function to convert hex to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// UI Functions
function updateScoreboard() {
    scoresContainer.innerHTML = '';
    
    gameState.players.forEach(player => {
        const scoreElement = document.createElement('div');
        scoreElement.className = 'player-score';
        scoreElement.style.borderColor = player.color;
        
        if (player.id === gameState.playerId) {
            scoreElement.classList.add('current-player');
        }
        
        if (!player.alive) {
            scoreElement.classList.add('dead');
        }
        
        scoreElement.innerHTML = `
            <div style="color: ${player.color};">${player.name}</div>
            <div>${player.score}</div>
        `;
        
        scoresContainer.appendChild(scoreElement);
    });
}

function showMessage(message, type = 'info') {
    const messageElement = document.createElement('div');
    messageElement.className = `game-message ${type}`;
    messageElement.textContent = message;
    
    gameMessages.appendChild(messageElement);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.parentNode.removeChild(messageElement);
        }
    }, 3000);
}

function showGameOver() {
    const currentPlayer = gameState.players.find(p => p.id === gameState.playerId);
    if (currentPlayer) {
        finalScoreElement.textContent = currentPlayer.score;
    }
    gameOverElement.style.display = 'block';
    
    // Add vibration feedback on mobile
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }
}

function showGameEnded(data) {
    gameEndedElement.style.display = 'block';
    
    // Show winner info
    if (data.winner) {
        winnerInfo.innerHTML = `
            <p>🏆 Winner: <span class="winner">${data.winner.name}</span></p>
            <p>Final Score: ${data.winner.score}</p>
        `;
    } else {
        winnerInfo.innerHTML = '<p>No winner - everyone died!</p>';
    }
    
    // Show final scores
    finalScores.innerHTML = '<h3>Final Scores:</h3>';
    data.scores.sort((a, b) => b.score - a.score).forEach((player, index) => {
        const scoreItem = document.createElement('div');
        scoreItem.className = 'final-score-item';
        scoreItem.innerHTML = `
            <span>${index + 1}. ${player.name}</span>
            <span>${player.score}</span>
        `;
        finalScores.appendChild(scoreItem);
    });
}

function hideGameScreens() {
    gameOverElement.style.display = 'none';
    gameEndedElement.style.display = 'none';
}

function returnToLobby() {
    // Disconnect and return to name entry
    if (socket) {
        socket.disconnect();
    }
    
    gameState = {
        connected: false,
        inGame: false,
        playerId: null,
        playerName: '',
        roomId: null,
        players: [],
        food: null,
        gameRunning: false
    };
    
    nameEntryScreen.style.display = 'block';
    gameScreen.style.display = 'none';
    hideGameScreens();
    
    // Clear messages
    gameMessages.innerHTML = '';
}

function playAgain() {
    // Keep the player name and rejoin quickly
    const savedPlayerName = gameState.playerName;
    
    // Disconnect from current game
    if (socket) {
        socket.disconnect();
    }
    
    // Reset game state but keep player name
    gameState = {
        connected: false,
        inGame: false,
        playerId: null,
        playerName: savedPlayerName,
        roomId: null,
        players: [],
        food: null,
        gameRunning: false
    };
    
    hideGameScreens();
    
    // Clear messages
    gameMessages.innerHTML = '';
    
    // Auto-rejoin with saved name
    connectToServer();
    
    // Show rejoining message
    showMessage('Rejoining game...', 'info');
    
    // Wait for connection then join automatically
    const rejoinAttempt = () => {
        if (gameState.connected) {
            socket.emit('joinGame', { playerName: savedPlayerName });
        } else {
            setTimeout(rejoinAttempt, 100);
        }
    };
    rejoinAttempt();
}

// Change direction (send to server)
function changeDirection(newDirection, isFirstMove = false) {
    if (!gameState.connected || !gameState.inGame) return;
    
    socket.emit('changeDirection', { direction: newDirection, isFirstMove: isFirstMove });
}

// Calculate direction toward center from current position
function getDirectionToCenter(currentPos) {
    const centerX = Math.floor(GRID_WIDTH / 2);
    const centerY = Math.floor(GRID_HEIGHT / 2);
    
    const deltaX = centerX - currentPos.x;
    const deltaY = centerY - currentPos.y;
    
    // Choose the direction with the larger distance
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        return { x: Math.sign(deltaX), y: 0 };
    } else {
        return { x: 0, y: Math.sign(deltaY) };
    }
}

// Check if current player has started moving
function hasCurrentPlayerStartedMoving() {
    const currentPlayer = gameState.players.find(p => p.id === gameState.playerId);
    return currentPlayer ? currentPlayer.hasStartedMoving : false;
}

// Event Handlers
joinGameBtn.addEventListener('click', () => {
    const playerName = playerNameInput.value.trim();
    if (!playerName) {
        showMessage('Please enter your name', 'error');
        return;
    }
    
    if (!gameState.connected) {
        connectToServer();
    }
    
    gameState.playerName = playerName;
    joinGameBtn.disabled = true;
    joinGameBtn.textContent = 'Joining...';
    
    // Wait for connection then join
    const joinAttempt = () => {
        if (gameState.connected) {
            socket.emit('joinGame', { playerName });
        } else {
            setTimeout(joinAttempt, 100);
        }
    };
    joinAttempt();
});

// Enter key to join game
playerNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        joinGameBtn.click();
    }
});

// Restart game buttons
restartBtn.addEventListener('click', playAgain);
newGameBtn.addEventListener('click', playAgain);

// Return to lobby buttons (for changing name)
backToLobbyBtn.addEventListener('click', returnToLobby);
backToLobbyBtn2.addEventListener('click', returnToLobby);

// Keyboard controls
document.addEventListener('keydown', (e) => {
    const direction = getKeyDirection(e.code);
    if (direction) {
        e.preventDefault();
        const isFirstMove = !hasCurrentPlayerStartedMoving();
        changeDirection(direction, isFirstMove);
    }
});

function getKeyDirection(keyCode) {
    switch (keyCode) {
        case 'ArrowUp':
        case 'KeyW':
            return { x: 0, y: -1 };
        case 'ArrowDown':
        case 'KeyS':
            return { x: 0, y: 1 };
        case 'ArrowLeft':
        case 'KeyA':
            return { x: -1, y: 0 };
        case 'ArrowRight':
        case 'KeyD':
            return { x: 1, y: 0 };
        default:
            return null;
    }
}

// Touch controls
function addTouchControls() {
    const handleDirectionInput = (direction) => {
        const isFirstMove = !hasCurrentPlayerStartedMoving();
        changeDirection(direction, isFirstMove);
    };
    
    upBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleDirectionInput({ x: 0, y: -1 });
    });
    
    downBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleDirectionInput({ x: 0, y: 1 });
    });
    
    leftBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleDirectionInput({ x: -1, y: 0 });
    });
    
    rightBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleDirectionInput({ x: 1, y: 0 });
    });
    
    // Also add click events for mouse users
    upBtn.addEventListener('click', () => handleDirectionInput({ x: 0, y: -1 }));
    downBtn.addEventListener('click', () => handleDirectionInput({ x: 0, y: 1 }));
    leftBtn.addEventListener('click', () => handleDirectionInput({ x: -1, y: 0 }));
    rightBtn.addEventListener('click', () => handleDirectionInput({ x: 1, y: 0 }));
}

// Touch controls for mobile - handle tap vs swipe
let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const touchEndTime = Date.now();
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const deltaTime = touchEndTime - touchStartTime;
    
    const minSwipeDistance = 30;
    const maxTapTime = 200; // Max time for a tap in milliseconds
    const maxTapDistance = 10; // Max distance for a tap
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const isTap = distance < maxTapDistance && deltaTime < maxTapTime;
    
    if (!hasCurrentPlayerStartedMoving()) {
        // First interaction - determine if tap or swipe
        if (isTap) {
            // Tap - move toward center
            const currentPlayer = gameState.players.find(p => p.id === gameState.playerId);
            if (currentPlayer && currentPlayer.snake.length > 0) {
                const direction = getDirectionToCenter(currentPlayer.snake[0]);
                changeDirection(direction, true);
            }
        } else if (distance >= minSwipeDistance) {
            // Swipe - move in swipe direction
            let direction;
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                direction = deltaX > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
            } else {
                // Vertical swipe
                direction = deltaY > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
            }
            changeDirection(direction, true);
        }
    } else {
        // Already moving - normal swipe controls
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (Math.abs(deltaX) > minSwipeDistance) {
                if (deltaX > 0) {
                    changeDirection({ x: 1, y: 0 }); // Right
                } else {
                    changeDirection({ x: -1, y: 0 }); // Left
                }
            }
        } else {
            // Vertical swipe
            if (Math.abs(deltaY) > minSwipeDistance) {
                if (deltaY > 0) {
                    changeDirection({ x: 0, y: 1 }); // Down
                } else {
                    changeDirection({ x: 0, y: -1 }); // Up
                }
            }
        }
    }
});

// Prevent context menu on long press
canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Mouse click handler for desktop - same logic as tap
canvas.addEventListener('click', (e) => {
    e.preventDefault();
    
    if (!hasCurrentPlayerStartedMoving()) {
        // First click - move toward center
        const currentPlayer = gameState.players.find(p => p.id === gameState.playerId);
        if (currentPlayer && currentPlayer.snake.length > 0) {
            const direction = getDirectionToCenter(currentPlayer.snake[0]);
            changeDirection(direction, true);
        }
    }
});

// Initialize game
function init() {
    addTouchControls();
    
    // Adjust canvas size for mobile
    function resizeCanvas() {
        const container = canvas.parentElement;
        const containerWidth = container.offsetWidth;
        const maxSize = Math.min(containerWidth - 40, 400);
        
        canvas.style.width = maxSize + 'px';
        canvas.style.height = maxSize + 'px';
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Start draw loop
    function drawLoop() {
        draw();
        requestAnimationFrame(drawLoop);
    }
    drawLoop();
    
    // Reset UI to initial state
    joinGameBtn.disabled = false;
    joinGameBtn.textContent = 'Join Game';
    nameEntryScreen.style.display = 'block';
    gameScreen.style.display = 'none';
    
    // Focus on name input
    playerNameInput.focus();
}

// Start the game when page loads
window.addEventListener('load', init);