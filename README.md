# 🐍 Snake Game - Mobile Friendly

A modern, responsive Snake game built with HTML5 Canvas, CSS3, and JavaScript. Optimized for both desktop and mobile devices with touch controls and swipe gestures.

## ✨ Features

- **Mobile Optimized**: Touch controls and swipe gestures
- **Responsive Design**: Works on all screen sizes
- **PWA Ready**: Can be installed on mobile devices
- **High Score Tracking**: Persistent local storage of best scores
- **Smooth Animations**: Pulsing food and polished graphics
- **Haptic Feedback**: Vibration on mobile devices
- **Multiple Control Methods**:
  - Arrow keys (desktop)
  - WASD keys (desktop)
  - Touch buttons (mobile)
  - Swipe gestures (mobile)

## 🎮 How to Play

1. Use arrow keys, WASD, touch controls, or swipe to move the snake
2. Eat the red food to grow and score points
3. Avoid hitting walls or yourself
4. Try to beat your high score!

## 🚀 Quick Deploy

### Deploy to Netlify
1. Fork this repository
2. Connect your GitHub account to [Netlify](https://netlify.com)
3. Deploy directly from GitHub - the game will be live instantly!

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts to deploy

### Deploy to GitHub Pages
1. Push to a GitHub repository
2. Go to Settings → Pages
3. Select source branch (usually `main`)
4. Your game will be available at `https://yourusername.github.io/repository-name`

### Deploy to any Static Host
Simply upload these files to any web server:
- `index.html`
- `style.css`
- `game.js`
- `manifest.json`
- `netlify.toml` (optional, for Netlify)

## 🛠️ Local Development

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd snake-game
   ```

2. Open `index.html` in your browser, or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

3. Navigate to `http://localhost:8000`

## 📱 Mobile Installation

The game can be installed as a Progressive Web App (PWA):

1. Open the game in a mobile browser
2. Look for "Add to Home Screen" option
3. The game will be available as a native-feeling app

## 🎯 Game Features

- **Score System**: 10 points per food eaten
- **Progressive Difficulty**: Game feels more challenging as snake grows
- **Collision Detection**: Wall and self-collision
- **Responsive Canvas**: Automatically adjusts to screen size
- **Modern UI**: Glassmorphism design with smooth animations

## 🔧 Customization

### Changing Game Speed
Edit the `setInterval` call in `game.js`:
```javascript
setInterval(gameLoop, 150); // Lower = faster, Higher = slower
```

### Modifying Colors
Update the color variables in `style.css` and `game.js`:
- Snake: `#27ae60` (body), `#2ecc71` (head)
- Food: `#e74c3c`
- Background: `#2c3e50`

### Adjusting Grid Size
Modify `GRID_SIZE` in `game.js` (20px default):
```javascript
const GRID_SIZE = 20; // Smaller = more precise movement
```

## 🌐 Browser Support

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 License

MIT License - feel free to use this code for your own projects!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

Made with ❤️ for the love of classic games!
