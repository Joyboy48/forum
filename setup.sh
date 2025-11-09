#!/bin/bash

echo "🚀 Setting up Learnato Forum..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Create .env files if they don't exist
if [ ! -f "server/.env" ]; then
    echo "📝 Creating server/.env from .env.example..."
    cp server/.env.example server/.env
fi

if [ ! -f "client/.env" ]; then
    echo "📝 Creating client/.env from .env.example..."
    cp client/.env.example client/.env
fi

echo "✅ Environment files ready"

# Build and start containers
echo "🐳 Building and starting Docker containers..."
docker-compose up --build -d

echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 Access the application at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo ""
echo "📊 View logs: docker-compose logs -f"
echo "🛑 Stop services: docker-compose down"
echo ""

