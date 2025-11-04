#!/bin/bash

# P-Type Development Quick Start Script
# This script helps you get started with P-Type development

set -e

echo "🎮 P-Type Development Setup"
echo "=============================="
echo ""

# Check Node.js version
echo "📦 Checking Node.js version..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current: $(node -v)"
    exit 1
fi
echo "✅ Node.js $(node -v) detected"
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi
echo ""

# Check for .env.local
if [ ! -f ".env.local" ]; then
    echo "⚙️  Setting up environment..."
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo "✅ Created .env.local from .env.example"
        echo ""
        echo "⚠️  IMPORTANT: Edit .env.local and add your Rodin API key!"
        echo "   RODIN_API_KEY=your_key_here"
        echo ""
    else
        echo "⚠️  No .env.example found"
    fi
else
    echo "✅ .env.local exists"
fi
echo ""

# Menu
echo "What would you like to do?"
echo ""
echo "1) Start development server (npm run dev)"
echo "2) Build for production (npm run build)"
echo "3) Preview production build (npm run preview)"
echo "4) Check project status"
echo "5) Exit"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Starting development server..."
        echo "   Access at: http://localhost:3000"
        echo ""
        npm run dev
        ;;
    2)
        echo ""
        echo "🔨 Building for production..."
        npm run build
        echo ""
        echo "✅ Build complete! Check the 'dist' folder."
        echo ""
        ;;
    3)
        echo ""
        echo "👀 Previewing production build..."
        npm run preview
        ;;
    4)
        echo ""
        echo "📊 Project Status:"
        echo ""
        
        # Check if build works
        echo "Build status:"
        if npm run build &> /dev/null; then
            echo "  ✅ Build successful"
        else
            echo "  ❌ Build failed - run 'npm run build' for details"
        fi
        echo ""
        
        # Check file structure
        echo "File structure:"
        [ -d "web/src" ] && echo "  ✅ web/src exists" || echo "  ❌ web/src missing"
        [ -d "api" ] && echo "  ✅ api exists" || echo "  ❌ api missing"
        [ -f "vite.config.ts" ] && echo "  ✅ vite.config.ts exists" || echo "  ❌ vite.config.ts missing"
        [ -f "vercel.json" ] && echo "  ✅ vercel.json exists" || echo "  ❌ vercel.json missing"
        echo ""
        
        # Check env
        echo "Environment:"
        if [ -f ".env.local" ]; then
            if grep -q "your_rodin" .env.local; then
                echo "  ⚠️  .env.local needs Rodin API key"
            else
                echo "  ✅ .env.local configured"
            fi
        else
            echo "  ❌ .env.local missing"
        fi
        echo ""
        
        echo "📖 For more info, see:"
        echo "   - WEB_README.md - Project overview"
        echo "   - PROJECT_STATUS.md - Current status & next steps"
        echo "   - DEPLOYMENT.md - Deployment guide"
        echo ""
        ;;
    5)
        echo ""
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo ""
        echo "❌ Invalid choice"
        exit 1
        ;;
esac
