@echo off
REM Quick Start Script for E-commerce Platform (Windows)
REM This script sets up and starts the entire application using Docker

echo.
echo 🚀 E-commerce Platform - Docker Quick Start
echo ==========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    echo    Visit: https://docs.docker.com/desktop/install/windows-install/
    pause
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker Desktop.
    pause
    exit /b 1
)

echo ✅ Docker is installed and running
echo.

REM Check if .env.docker exists
if not exist ".env.docker" (
    echo 📝 Creating .env.docker from example...
    copy .env.docker.example .env.docker >nul
    echo ✅ .env.docker created
    echo    ⚠️  Review and update credentials in .env.docker before production use!
) else (
    echo ✅ .env.docker already exists
)
echo.

REM Stop any existing containers
echo 🧹 Cleaning up existing containers...
docker-compose down >nul 2>&1
echo.

REM Build and start services
echo 🔨 Building and starting services...
echo    This may take a few minutes on first run...
docker-compose --env-file .env.docker up -d --build

echo.
echo ⏳ Waiting for services to be healthy...
timeout /t 10 /nobreak >nul

REM Check service status
echo.
echo 📊 Service Status:
docker-compose ps

echo.
echo ✅ Application is ready!
echo.
echo 📍 Access Points:
echo    Frontend:  http://localhost
echo    Backend:   http://localhost:3000/api
echo    Database:  localhost:5432 (user: hassan, db: ecommercedb)
echo    Redis:     localhost:6379
echo.
echo 🔐 Default Admin Credentials:
echo    Email:     admin@admin.com
echo    Password:  12345678
echo.
echo 📖 Documentation:
echo    Docker Guide:     DOCKER.md
echo    Render Setup:     RENDER_SETUP.md
echo    Full README:      README.md
echo.
echo 💡 Useful Commands:
echo    View logs:        docker-compose logs -f
echo    Stop services:    docker-compose down
echo    Restart:          docker-compose restart
echo.
echo 🎉 Happy coding!
echo.
pause
