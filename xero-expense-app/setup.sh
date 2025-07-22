#!/bin/bash

echo "�� Setting up Xero Expense Management Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install

# Install client dependencies
echo "📦 Installing client dependencies..."
cd ../client
npm install

# Return to root
cd ..

# Create environment files
echo "🔧 Creating environment files..."

# Server .env
if [ ! -f "server/.env" ]; then
    echo "Creating server/.env from template..."
    cp server/.env.example server/.env
    echo "⚠️  Please edit server/.env with your configuration"
fi

# Client .env
if [ ! -f "client/.env" ]; then
    echo "Creating client/.env..."
    cat > client/.env << 'ENV'
VITE_API_URL=http://localhost:3001
ENV
fi

echo ""
echo "�� Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit server/.env with your configuration"
echo "2. Set up your PostgreSQL database"
echo "3. Configure your Xero Developer app"
echo "4. Get an OCR API key (e.g., from OCR.space)"
echo ""
echo "🚀 To start development:"
echo "  npm run dev"
echo ""
echo "📚 For more information, see README.md"
