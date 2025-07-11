#!/bin/bash

echo "🐍 Snake Game Deployment Helper"
echo "================================"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Initializing..."
    git init
    git add .
    git commit -m "Initial commit: Snake Game"
fi

echo "🎯 Choose deployment option:"
echo "1) Deploy to Netlify (requires netlify-cli)"
echo "2) Deploy to Vercel (requires vercel-cli)"
echo "3) Deploy to GitHub Pages (requires git remote)"
echo "4) Start local server"
echo "5) Exit"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "📦 Deploying to Netlify..."
        if command -v netlify &> /dev/null; then
            netlify deploy --prod --dir .
            echo "✅ Deployed to Netlify!"
        else
            echo "❌ Netlify CLI not found. Install with: npm install -g netlify-cli"
        fi
        ;;
    2)
        echo "📦 Deploying to Vercel..."
        if command -v vercel &> /dev/null; then
            vercel --prod
            echo "✅ Deployed to Vercel!"
        else
            echo "❌ Vercel CLI not found. Install with: npm install -g vercel"
        fi
        ;;
    3)
        echo "📦 Deploying to GitHub Pages..."
        if git remote get-url origin &> /dev/null; then
            git add .
            git commit -m "Update Snake Game"
            git push origin main
            echo "✅ Pushed to GitHub! Enable Pages in repository settings."
        else
            echo "❌ No git remote found. Add your GitHub repository:"
            echo "git remote add origin https://github.com/yourusername/snake-game.git"
        fi
        ;;
    4)
        echo "🚀 Starting local server..."
        echo "Game will be available at: http://localhost:8000"
        if command -v python3 &> /dev/null; then
            python3 -m http.server 8000
        elif command -v python &> /dev/null; then
            python -m http.server 8000
        elif command -v node &> /dev/null; then
            npx serve . -l 8000
        else
            echo "❌ No suitable server found. Please install Python or Node.js"
        fi
        ;;
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        ;;
esac