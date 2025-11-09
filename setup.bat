@echo off
echo 🚀 Setting up Learnato Forum...

REM Check if Docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    exit /b 1
)

where docker-compose >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

echo ✅ Docker and Docker Compose are installed

REM Create .env files if they don't exist
if not exist "server\.env" (
    echo 📝 Creating server\.env from .env.example...
    copy server\.env.example server\.env
)

if not exist "client\.env" (
    echo 📝 Creating client\.env from .env.example...
    copy client\.env.example client\.env
)

echo ✅ Environment files ready

REM Build and start containers
echo 🐳 Building and starting Docker containers...
docker-compose up --build -d

echo.
echo ✅ Setup complete!
echo.
echo 🌐 Access the application at:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:5000
echo.
echo 📊 View logs: docker-compose logs -f
echo 🛑 Stop services: docker-compose down
echo.

pause

