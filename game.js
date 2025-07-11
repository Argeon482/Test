// Game state
let gameState = {
    running: false,
    score: 0,
    highScore: 0
};

// Canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game settings
const GRID_SIZE = 20;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 400;
const GRID_WIDTH = CANVAS_WIDTH / GRID_SIZE;
const GRID_HEIGHT = CANVAS_HEIGHT / GRID_SIZE;

// Snake initial state
let snake = [
    { x: 10, y: 10 }
];
let direction = { x: 0, y: 0 };
let food = generateFood();

// Game elements
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');

// Control buttons
const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

// Load high score from localStorage
gameState.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
highScoreElement.textContent = gameState.highScore;

// Generate random food position
function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * GRID_WIDTH),
            y: Math.floor(Math.random() * GRID_HEIGHT)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
}

// Draw game elements
function draw() {
    // Clear canvas
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw snake
    ctx.fillStyle = '#27ae60';
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Head - slightly different color
            ctx.fillStyle = '#2ecc71';
        } else {
            ctx.fillStyle = '#27ae60';
        }
        
        ctx.fillRect(
            segment.x * GRID_SIZE + 1,
            segment.y * GRID_SIZE + 1,
            GRID_SIZE - 2,
            GRID_SIZE - 2
        );
        
        // Add some shine effect to make it look better
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(
            segment.x * GRID_SIZE + 2,
            segment.y * GRID_SIZE + 2,
            GRID_SIZE - 8,
            GRID_SIZE - 8
        );
    });
    
    // Draw food with animation effect
    const time = Date.now() * 0.005;
    const pulseSize = Math.sin(time) * 2;
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(
        food.x * GRID_SIZE + 1 - pulseSize/2,
        food.y * GRID_SIZE + 1 - pulseSize/2,
        GRID_SIZE - 2 + pulseSize,
        GRID_SIZE - 2 + pulseSize
    );
    
    // Add apple shine
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(
        food.x * GRID_SIZE + 3,
        food.y * GRID_SIZE + 3,
        GRID_SIZE - 10,
        GRID_SIZE - 10
    );
}

// Update game logic
function update() {
    if (!gameState.running) return;
    
    // Move snake
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    
    // Check wall collision
    if (head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT) {
        gameOver();
        return;
    }
    
    // Check self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }
    
    snake.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        gameState.score += 10;
        scoreElement.textContent = gameState.score;
        
        // Check for new high score
        if (gameState.score > gameState.highScore) {
            gameState.highScore = gameState.score;
            highScoreElement.textContent = gameState.highScore;
            localStorage.setItem('snakeHighScore', gameState.highScore);
        }
        
        food = generateFood();
        
        // Add vibration feedback on mobile
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    } else {
        snake.pop();
    }
}

// Game over function
function gameOver() {
    gameState.running = false;
    finalScoreElement.textContent = gameState.score;
    gameOverElement.style.display = 'block';
    
    // Add vibration feedback on mobile
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }
}

// Start new game
function startGame() {
    gameState.running = true;
    gameState.score = 0;
    scoreElement.textContent = gameState.score;
    
    snake = [{ x: 10, y: 10 }];
    direction = { x: 1, y: 0 }; // Start moving right
    food = generateFood();
    
    gameOverElement.style.display = 'none';
}

// Change direction (with validation to prevent reverse)
function changeDirection(newDirection) {
    if (!gameState.running) return;
    
    // Prevent reversing into self
    if (snake.length > 1) {
        if (newDirection.x === -direction.x && newDirection.y === -direction.y) {
            return;
        }
    }
    
    direction = newDirection;
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!gameState.running && e.code === 'Space') {
        startGame();
        return;
    }
    
    switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
            e.preventDefault();
            changeDirection({ x: 0, y: -1 });
            break;
        case 'ArrowDown':
        case 'KeyS':
            e.preventDefault();
            changeDirection({ x: 0, y: 1 });
            break;
        case 'ArrowLeft':
        case 'KeyA':
            e.preventDefault();
            changeDirection({ x: -1, y: 0 });
            break;
        case 'ArrowRight':
        case 'KeyD':
            e.preventDefault();
            changeDirection({ x: 1, y: 0 });
            break;
    }
});

// Touch controls
function addTouchControls() {
    upBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!gameState.running) startGame();
        else changeDirection({ x: 0, y: -1 });
    });
    
    downBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!gameState.running) startGame();
        else changeDirection({ x: 0, y: 1 });
    });
    
    leftBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!gameState.running) startGame();
        else changeDirection({ x: -1, y: 0 });
    });
    
    rightBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!gameState.running) startGame();
        else changeDirection({ x: 1, y: 0 });
    });
    
    // Also add click events for mouse users
    upBtn.addEventListener('click', () => {
        if (!gameState.running) startGame();
        else changeDirection({ x: 0, y: -1 });
    });
    
    downBtn.addEventListener('click', () => {
        if (!gameState.running) startGame();
        else changeDirection({ x: 0, y: 1 });
    });
    
    leftBtn.addEventListener('click', () => {
        if (!gameState.running) startGame();
        else changeDirection({ x: -1, y: 0 });
    });
    
    rightBtn.addEventListener('click', () => {
        if (!gameState.running) startGame();
        else changeDirection({ x: 1, y: 0 });
    });
}

// Swipe controls for mobile
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    
    if (!gameState.running) {
        startGame();
        return;
    }
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    const minSwipeDistance = 30;
    
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
});

// Restart button
restartBtn.addEventListener('click', startGame);

// Prevent context menu on long press
canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Game loop
function gameLoop() {
    update();
    draw();
}

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
    
    // Start the game loop
    setInterval(gameLoop, 150); // ~6.7 FPS for classic snake feel
    
    // Initial draw
    draw();
    
    // Show initial instructions
    if (!gameState.running) {
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Press any arrow key', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 - 20);
        ctx.fillText('or touch controls to start!', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 10);
    }
}

// Start the game when page loads
window.addEventListener('load', init);