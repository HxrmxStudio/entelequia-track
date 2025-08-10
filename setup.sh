#!/bin/bash

echo "🚀 Setting up Entelequia Track development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "📦 Starting services with Docker Compose..."
# Use Compose v2 syntax `docker compose`
POSTGRES_PORT=${POSTGRES_PORT:-5433} REDIS_PORT=${REDIS_PORT:-6380} docker compose up -d db redis minio create-bucket

echo "⏳ Waiting for services to be ready..."
sleep 10

echo "🔧 Setting up backend..."
cd backend
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cp env.example .env
    echo "⚠️  Please update .env file with your actual credentials"
fi

echo "💎 Installing Ruby gems..."
bundle install

echo "🗄️  Setting up database..."
rails db:create db:migrate

echo "🔙 Backend setup complete!"

echo "🎨 Setting up panel..."
cd ../panel
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file from example..."
    cp env.example .env.local
fi

echo "📦 Installing Node.js dependencies..."
npm install

echo "🔙 Panel setup complete!"

echo "📱 Setting up courier app..."
cd ../courier-app
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cp env.example .env
fi

echo "📦 Installing Node.js dependencies..."
npm install

echo "🔙 Courier app setup complete!"

echo ""
echo "✅ Setup complete! You can now:"
echo ""
echo "Backend:"
echo "  cd backend && rails server"
echo ""
echo "Panel:"
echo "  cd panel && npm run dev"
echo ""
echo "Courier App:"
echo "  cd courier-app && npm run web"
echo ""
echo "Or use Docker Compose:"
echo "  docker-compose up -d" 