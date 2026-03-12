#!/bin/bash

# Quick Start Script for E-commerce Platform
# This script sets up and starts the entire application using Docker

set -e  # Exit on error

echo "🚀 E-commerce Platform - Docker Quick Start"
echo "=========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker is installed and running"
echo ""

# Check if .env.docker exists
if [ ! -f .env.docker ]; then
    echo "📝 Creating .env.docker from example..."
    cp .env.docker.example .env.docker
    echo "✅ .env.docker created"
    echo "   ⚠️  Review and update credentials in .env.docker before production use!"
else
    echo "✅ .env.docker already exists"
fi
echo ""

# Stop any existing containers
echo "🧹 Cleaning up existing containers..."
docker-compose down 2>/dev/null || true
echo ""

# Build and start services
echo "🔨 Building and starting services..."
echo "   This may take a few minutes on first run..."
docker-compose --env-file .env.docker up -d --build

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service status
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ Application is ready!"
echo ""
echo "📍 Access Points:"
echo "   Frontend:  http://localhost"
echo "   Backend:   http://localhost:3000/api"
echo "   Database:  localhost:5432 (user: hassan, db: ecommercedb)"
echo "   Redis:     localhost:6379"
echo ""
echo "🔐 Default Admin Credentials:"
echo "   Email:     admin@admin.com"
echo "   Password:  12345678"
echo ""
echo "📖 Documentation:"
echo "   Docker Guide:     ./DOCKER.md"
echo "   Render Setup:     ./RENDER_SETUP.md"
echo "   Full README:      ./README.md"
echo ""
echo "💡 Useful Commands:"
echo "   View logs:        docker-compose logs -f"
echo "   Stop services:    docker-compose down"
echo "   Restart:          docker-compose restart"
echo ""
echo "🎉 Happy coding!"
