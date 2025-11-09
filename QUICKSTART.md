# Quick Start Guide

## 🚀 Fastest Way to Get Started (Docker)

1. **Clone and navigate to the project**
   ```bash
   cd talentloom
   ```

2. **Run the setup script**
   - **Windows**: Double-click `setup.bat` or run `setup.bat` in PowerShell
   - **Mac/Linux**: Run `chmod +x setup.sh && ./setup.sh`

3. **Or manually start with Docker Compose**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Open your browser to: http://localhost:3000
   - The backend API is available at: http://localhost:5000

## 🛠️ Local Development Setup

### Prerequisites
- Node.js 18+ installed
- MongoDB running (or use Docker for MongoDB only)

### Steps

1. **Install dependencies**
   ```bash
   npm run install-all
   ```

2. **Set up environment variables**

   Create `server/.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/learnato-forum
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

   Create `client/.env`:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

3. **Start MongoDB** (if not using Docker)
   ```bash
   # Option 1: Use Docker for MongoDB only
   docker run -d -p 27017:27017 --name mongo mongo:7
   
   # Option 2: Use your local MongoDB installation
   ```

4. **Start the development servers**
   ```bash
   # From root directory - starts both frontend and backend
   npm run dev
   
   # Or start separately:
   # Terminal 1: Backend
   cd server && npm run dev
   
   # Terminal 2: Frontend  
   cd client && npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## ✅ Verify Installation

1. Open http://localhost:3000 in your browser
2. Click "New Post" to create a test post
3. Add a title and content, then submit
4. You should see your post appear in real-time
5. Click on the post to view details and add replies
6. Try upvoting posts

## 🐛 Troubleshooting

**Port already in use:**
- Change ports in `docker-compose.yml` or `.env` files
- Kill processes: `lsof -ti:3000 | xargs kill` (Mac/Linux)

**MongoDB connection error:**
- Ensure MongoDB is running
- Check `MONGODB_URI` in `server/.env`
- For Docker: `docker-compose ps` to check mongo service

**Docker build fails:**
- Clear Docker cache: `docker-compose build --no-cache`
- Check Docker is running: `docker ps`

**Socket.io not connecting:**
- Check browser console for errors
- Verify `CLIENT_URL` in server `.env` matches frontend URL
- Check CORS settings in `server/server.js`

## 📚 Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore the API endpoints
- Customize the UI theme
- Add new features!

---

**Happy coding! 🎉**

