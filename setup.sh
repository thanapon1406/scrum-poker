#!/bin/bash

# Planning Poker Setup Script
# This script helps you set up the project quickly

set -e

echo "🎲 Planning Poker Online - Setup Script"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. You have version $NODE_VERSION."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  No .env.local file found"
    echo ""
    echo "Creating .env.local from template..."
    cp .env.local.example .env.local
    
    echo ""
    echo "📝 Please update .env.local with your Supabase credentials:"
    echo ""
    echo "1. Go to https://supabase.com and create a project"
    echo "2. Navigate to Project Settings → API"
    echo "3. Copy your Project URL and anon key"
    echo "4. Edit .env.local and add your credentials"
    echo ""
    echo "Then run: npm run dev"
    echo ""
    
    # Ask if user wants to open .env.local
    read -p "Open .env.local now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ${EDITOR:-nano} .env.local
    fi
else
    echo "✅ .env.local file exists"
    
    # Check if env vars are set
    if grep -q "your_supabase_project_url" .env.local || grep -q "your_supabase_anon_key" .env.local; then
        echo "⚠️  .env.local still contains placeholder values"
        echo ""
        read -p "Would you like to edit .env.local now? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            ${EDITOR:-nano} .env.local
        fi
    else
        echo "✅ Environment variables appear to be configured"
    fi
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo ""
echo "1. Set up Supabase:"
echo "   - Create a Supabase project at https://supabase.com"
echo "   - Run the SQL migration from supabase/migrations/001_initial_schema.sql"
echo "   - Add your credentials to .env.local"
echo ""
echo "2. Start the development server:"
echo "   npm run dev"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "📚 For detailed instructions, see QUICKSTART.md"
echo ""
