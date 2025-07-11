const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Game constants
const GRID_SIZE = 20;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 400;
const GRID_WIDTH = CANVAS_WIDTH / GRID_SIZE;
const GRID_HEIGHT = CANVAS_HEIGHT / GRID_SIZE;
const MAX_PLAYERS_PER_ROOM = 5;
const GAME_SPEED = 150;

// Game state storage
const gameRooms = new Map();
const playerRooms = new Map();

// Snake colors for different players
const SNAKE_COLORS = [
    '#27ae60', // Green
    '#3498db', // Blue  
    '#e74c3c', // Red
    '#f39c12', // Orange
    '#9b59b6'  // Purple
];

class GameRoom {
    constructor(roomId) {
        this.id = roomId;
        this.players = new Map();
        this.gameState = {
            running: false,
            food: this.generateFood(),
            gameLoop: null
        };
        this.maxPlayers = MAX_PLAYERS_PER_ROOM;
    }

    addPlayer(playerId, playerName, socket) {
        if (this.players.size >= this.maxPlayers) {
            return false;
        }

        const playerIndex = this.players.size;
        const startPositions = [
            { x: 5, y: 5 },
            { x: 15, y: 5 },
            { x: 5, y: 15 },
            { x: 15, y: 15 },
            { x: 10, y: 10 }
        ];

        const player = {
            id: playerId,
            name: playerName,
            socket: socket,
            snake: [startPositions[playerIndex]],
            direction: { x: 1, y: 0 },
            score: 0,
            alive: true,
            color: SNAKE_COLORS[playerIndex]
        };

        this.players.set(playerId, player);
        
        // Start the game if this is the first player
        if (this.players.size === 1) {
            this.startGame();
        }

        return true;
    }

    removePlayer(playerId) {
        this.players.delete(playerId);
        
        // If no players left, stop the game
        if (this.players.size === 0) {
            this.stopGame();
            return true; // Signal to delete room
        }
        
        return false;
    }

    generateFood() {
        let newFood;
        let attempts = 0;
        const maxAttempts = 100;
        
        do {
            newFood = {
                x: Math.floor(Math.random() * GRID_WIDTH),
                y: Math.floor(Math.random() * GRID_HEIGHT)
            };
            attempts++;
        } while (this.isFoodOnSnake(newFood) && attempts < maxAttempts);
        
        return newFood;
    }

    isFoodOnSnake(foodPos) {
        for (const player of this.players.values()) {
            if (player.snake.some(segment => segment.x === foodPos.x && segment.y === foodPos.y)) {
                return true;
            }
        }
        return false;
    }

    startGame() {
        this.gameState.running = true;
        this.gameState.gameLoop = setInterval(() => {
            this.updateGame();
        }, GAME_SPEED);
    }

    stopGame() {
        this.gameState.running = false;
        if (this.gameState.gameLoop) {
            clearInterval(this.gameState.gameLoop);
            this.gameState.gameLoop = null;
        }
    }

    updateGame() {
        if (!this.gameState.running) return;

        let alivePlayers = 0;
        const updates = [];

        for (const player of this.players.values()) {
            if (!player.alive) continue;
            
            alivePlayers++;
            
            // Move snake
            const head = {
                x: player.snake[0].x + player.direction.x,
                y: player.snake[0].y + player.direction.y
            };

            // Check wall collision
            if (head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT) {
                player.alive = false;
                updates.push({ type: 'playerDied', playerId: player.id, playerName: player.name });
                continue;
            }

            // Check collision with any snake (including self)
            let collision = false;
            for (const otherPlayer of this.players.values()) {
                if (otherPlayer.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
                    collision = true;
                    break;
                }
            }

            if (collision) {
                player.alive = false;
                updates.push({ type: 'playerDied', playerId: player.id, playerName: player.name });
                continue;
            }

            player.snake.unshift(head);

            // Check food collision
            if (head.x === this.gameState.food.x && head.y === this.gameState.food.y) {
                player.score += 10;
                this.gameState.food = this.generateFood();
                updates.push({ type: 'foodEaten', playerId: player.id, newFood: this.gameState.food });
            } else {
                player.snake.pop();
            }
        }

        // Send game state to all players
        this.broadcastGameState();

        // Broadcast any special updates
        updates.forEach(update => {
            this.broadcastToRoom('gameUpdate', update);
        });

        // Check if game should end
        if (alivePlayers === 0) {
            this.endGame();
        }
    }

    changePlayerDirection(playerId, newDirection) {
        const player = this.players.get(playerId);
        if (!player || !player.alive) return;

        // Prevent reversing into self
        if (player.snake.length > 1) {
            if (newDirection.x === -player.direction.x && newDirection.y === -player.direction.y) {
                return;
            }
        }

        player.direction = newDirection;
    }

    getGameState() {
        const players = [];
        for (const player of this.players.values()) {
            players.push({
                id: player.id,
                name: player.name,
                snake: player.snake,
                score: player.score,
                alive: player.alive,
                color: player.color
            });
        }

        return {
            players: players,
            food: this.gameState.food,
            running: this.gameState.running
        };
    }

    broadcastGameState() {
        const gameState = this.getGameState();
        this.broadcastToRoom('gameState', gameState);
    }

    broadcastToRoom(event, data) {
        for (const player of this.players.values()) {
            player.socket.emit(event, data);
        }
    }

    endGame() {
        this.stopGame();
        
        // Calculate winner
        let winner = null;
        let highestScore = -1;
        
        for (const player of this.players.values()) {
            if (player.score > highestScore) {
                highestScore = player.score;
                winner = player;
            }
        }

        this.broadcastToRoom('gameEnded', {
            winner: winner ? { name: winner.name, score: winner.score } : null,
            scores: Array.from(this.players.values()).map(p => ({ name: p.name, score: p.score }))
        });

        // Remove all players and mark for deletion
        this.players.clear();
    }
}

// Find or create a room for a new player
function findAvailableRoom() {
    // Find a room with space
    for (const room of gameRooms.values()) {
        if (room.players.size < room.maxPlayers) {
            return room;
        }
    }
    
    // Create new room if none available
    const newRoomId = uuidv4();
    const newRoom = new GameRoom(newRoomId);
    gameRooms.set(newRoomId, newRoom);
    return newRoom;
}

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    socket.on('joinGame', (data) => {
        const { playerName } = data;
        
        if (!playerName || playerName.trim().length === 0) {
            socket.emit('error', { message: 'Please enter a valid name' });
            return;
        }

        // Find available room
        const room = findAvailableRoom();
        
        // Add player to room
        const success = room.addPlayer(socket.id, playerName.trim(), socket);
        
        if (success) {
            playerRooms.set(socket.id, room.id);
            socket.emit('joinedGame', {
                roomId: room.id,
                playerId: socket.id,
                playerCount: room.players.size
            });
            
            // Broadcast to other players that someone joined
            room.broadcastToRoom('playerJoined', {
                playerName: playerName.trim(),
                playerCount: room.players.size
            });
            
            // Send initial game state
            room.broadcastGameState();
        } else {
            socket.emit('error', { message: 'Room is full' });
        }
    });

    socket.on('changeDirection', (data) => {
        const roomId = playerRooms.get(socket.id);
        if (roomId) {
            const room = gameRooms.get(roomId);
            if (room) {
                room.changePlayerDirection(socket.id, data.direction);
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        
        const roomId = playerRooms.get(socket.id);
        if (roomId) {
            const room = gameRooms.get(roomId);
            if (room) {
                const player = room.players.get(socket.id);
                const shouldDeleteRoom = room.removePlayer(socket.id);
                
                if (player) {
                    room.broadcastToRoom('playerLeft', {
                        playerName: player.name,
                        playerCount: room.players.size
                    });
                }
                
                if (shouldDeleteRoom) {
                    gameRooms.delete(roomId);
                }
            }
            playerRooms.delete(socket.id);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Multiplayer Snake Game server running on port ${PORT}`);
});