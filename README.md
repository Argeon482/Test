# 🐍 Multiplayer Snake Game

A real-time multiplayer Snake game built with Node.js, Socket.io, HTML5 Canvas, and JavaScript. Play with up to 4 other players in the same room!

## 🎮 Features

### Multiplayer Gameplay
- **Real-time multiplayer** with up to 5 players per room
- **Automatic room matching** - join existing games or create new ones
- **Live scoreboard** showing all players and their scores
- **Player death handling** - continue watching or return to lobby
- **Game ending** - crowned winner when all players die

### Mobile-Friendly Controls
- Touch controls for mobile devices
- Swipe gestures for direction changes
- Responsive button layout
- Works on both desktop and mobile

### Modern UI
- **Player name entry** system
- **Real-time notifications** for player events
- **Color-coded snakes** - each player has a unique color
- **Live game messages** - see when players join, leave, or die
- **Game over screens** with final scores and winner

### Technical Features
- **Socket.io** for real-time communication
- **Room management** - automatic room creation and cleanup
- **Collision detection** between all players
- **Synchronized game state** across all clients

## 🚀 How to Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   - Go to `http://localhost:3000`
   - Enter your player name
   - Start playing!

## 🎯 How to Play

### Getting Started
1. Enter your name on the welcome screen
2. Click "Join Game" to be matched with other players
3. You'll be placed in a room with up to 4 other players

### Controls
- **Desktop:** Arrow keys or WASD
- **Mobile:** Touch controls or swipe gestures

### Game Rules
1. **Eat food** (red squares) to grow and score points
2. **Avoid walls** and other players' snakes
3. **Don't hit yourself** or other snakes
4. **Last player standing wins** when everyone else dies
5. **Return to lobby** when you die to join a new game

### Multiplayer Features
- **Automatic matching:** Join existing games or start new ones
- **5 players max** per room - 6th player starts a new room
- **Real-time sync:** All players see the same game state
- **Spectate mode:** Watch the game continue after you die
- **Room cleanup:** Empty rooms are automatically deleted

## 🏗️ Game Architecture

### Server (server.js)
- **Express server** serving static files
- **Socket.io** for real-time communication
- **Game rooms** with up to 5 players each
- **Game loop** running at 150ms intervals
- **Collision detection** and scoring
- **Player management** and room cleanup

### Client (game.js)
- **Socket.io client** for server communication
- **HTML5 Canvas** rendering
- **Real-time game state** updates
- **Mobile-responsive** touch controls
- **UI management** for different game states

### Key Components
- `GameRoom` class managing individual game instances
- Real-time player synchronization
- Automatic room assignment and creation
- Player death and respawn handling
- Winner determination and game ending

## 🛠️ Technical Stack

- **Backend:** Node.js + Express + Socket.io
- **Frontend:** Vanilla HTML5 + CSS3 + JavaScript
- **Real-time:** WebSocket communication via Socket.io
- **Rendering:** HTML5 Canvas API
- **Styling:** Modern CSS with mobile optimizations

## 📱 Browser Support

Works on all modern browsers:
- Chrome (recommended)
- Firefox  
- Safari
- Edge
- Mobile browsers (iOS Safari, Android Chrome)

## � Game Features

### Visual Elements
- **5 unique snake colors** for different players
- **Animated food** with pulsing effect
- **Player highlighting** - your snake has extra shine
- **Live scoreboard** with color-coded scores
- **Death indicators** - crossed out dead players

### User Experience
- **Instant join** - no waiting for lobbies
- **Seamless gameplay** - join games in progress
- **Mobile optimized** - touch and swipe controls
- **Real-time feedback** - live notifications
- **Graceful handling** - connection drops and rejoining

## � Development

### Running in Development
```bash
npm run dev  # Uses nodemon for auto-restart
```

### Project Structure
```
├── server.js          # Main server file
├── game.js            # Client-side game logic  
├── index.html         # Main HTML file
├── style.css          # Styles and responsive design
├── package.json       # Dependencies and scripts
└── README.md          # This file
```

### Key Game Mechanics
- **Room Management:** Players automatically join available rooms
- **Game Flow:** First player starts the game, others join seamlessly
- **Death Handling:** Dead players return to lobby to rejoin
- **Room Lifecycle:** Rooms auto-delete when empty
- **Collision System:** Server-side collision detection for fairness

## 🎯 Game Flow

1. **Player enters name** → Server connection established
2. **Auto-room matching** → Join existing room or create new one
3. **Game starts** → First player triggers game start
4. **Real-time gameplay** → All players synchronized
5. **Player death** → Return to lobby option
6. **Game end** → All players dead, show winner and scores
7. **Room cleanup** → Empty rooms automatically deleted

## 🤝 Contributing

Feel free to submit issues, feature requests, or pull requests to improve the game!

### Ideas for Contributions
- Power-ups system
- Different game modes
- Team play
- Spectator mode improvements
- Better mobile UI
- Sound effects
- Particle effects

## 📄 License

This project is open source and available under the MIT License.

---

**Enjoy playing Multiplayer Snake with friends! 🐍**
