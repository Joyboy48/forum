# Learnato Discussion Forum

A minimal, elegant, and professional Discussion Forum microservice built for the Learnato Hackathon with the theme: **"Empower learning through conversation."**

## 🎯 Features

### Core MVP Features
- ✅ **Create Post** - Add new questions/topics with title and content
- ✅ **List Posts** - View all posts sorted by votes or date
- ✅ **View Post** - See post details with all replies
- ✅ **Add Reply** - Respond to posts with threaded discussions
- ✅ **Upvote Post** - Increment vote count for posts (one vote per user)
- ✅ **Search Posts** - Filter posts by keyword in title, content, or author
- ✅ **Mark as Answered** - Instructors and post authors can mark questions as resolved
- ✅ **AI Assistant** - Powered by Google Gemini AI for:
  - Finding similar questions
  - Generating discussion summaries
- ✅ **User Authentication** - Login/Signup with JWT tokens
- ✅ **Dark Theme** - Toggle between light and dark modes
- ✅ **Responsive UI** - Fully adaptive design for desktop and mobile
- ✅ **Real-time Updates** - Live updates using Socket.io WebSocket

### Design Highlights
- 🎨 Minimalist black and white theme with clean animations
- 📱 Fully responsive design
- ⚡ Real-time updates for posts and replies
- 🎭 Smooth transitions and hover effects
- 💫 Professional edtech platform aesthetic

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB |
| Real-time | Socket.io |
| Deployment | Docker + Docker Compose |

## 📁 Project Structure

```
learnato-forum/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React Context (Socket)
│   │   ├── services/       # API service layer
│   │   └── App.js
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── server/                 # Express backend
│   ├── controllers/        # Request handlers
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── server.js
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml     # Multi-container setup
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- Docker and Docker Compose (for containerized deployment)
- MongoDB (if running locally without Docker)

### Option 1: Docker Deployment (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd talentloom
   ```

2. **Start all services with Docker Compose**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

### Option 2: Local Development

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
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   GEMINI_API_KEY=your-gemini-api-key-here
   ```
   
   **Note:** To enable AI features (similar posts and summaries), get a free API key from [Google AI Studio](https://makersuite.google.com/app/apikey) and add it to `GEMINI_API_KEY`. The app will work without it but will use basic keyword matching instead.

   Create `client/.env`:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   ```

3. **Start MongoDB** (if not using Docker)
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongo mongo:7
   
   # Or use your local MongoDB installation
   ```

4. **Start the development servers**
   ```bash
   # From root directory
   npm run dev
   
   # Or start separately:
   # Terminal 1: Backend
   cd server && npm run dev
   
   # Terminal 2: Frontend
   cd client && npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/posts?sort=date\|votes&search=keyword` | Get all posts (sorted and filtered) |
| `GET` | `/api/posts/:id` | Get single post with replies |
| `POST` | `/api/posts` | Create a new post |
| `POST` | `/api/posts/:id/reply` | Add reply to a post |
| `POST` | `/api/posts/:id/upvote` | Upvote a post |
| `POST` | `/api/posts/:id/mark-answered` | Mark post as answered (instructor/author only) |
| `GET` | `/api/ai/similar/:postId` | Get similar posts (AI-powered) |
| `GET` | `/api/ai/summarize/:postId` | Get discussion summary (AI-powered) |
| `POST` | `/api/auth/signup` | Register new user |
| `POST` | `/api/auth/login` | Login user |
| `GET` | `/api/auth/me` | Get current user info |

### Example API Requests

**Create Post:**
```bash
POST /api/posts
Content-Type: application/json

{
  "title": "How to use React Hooks?",
  "content": "I'm new to React and want to learn about hooks...",
  "author": "John Doe"
}
```

**Add Reply:**
```bash
POST /api/posts/:id/reply
Content-Type: application/json

{
  "content": "React Hooks are functions that let you use state...",
  "author": "Jane Smith"
}
```

**Upvote Post:**
```bash
POST /api/posts/:id/upvote
```

## 🎨 Design System

### Color Palette
- **Primary**: Black (#000000)
- **Secondary**: White (#FFFFFF)
- **Background**: Off-white (#F8FAFC)
- **Text**: Neutral gray (#374151)
- **Accent**: Amber (#FBBF24) - reserved for highlights

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700

### Animations
- Fade-in transitions
- Slide-up effects
- Scale-in modals
- Hover scale transforms

## 🔧 Environment Variables

### Server (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/learnato-forum
NODE_ENV=development
CLIENT_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
GEMINI_API_KEY=your-gemini-api-key-here
```

**Getting a Gemini API Key:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to `server/.env` as `GEMINI_API_KEY`
5. Restart the server: `docker-compose restart server`

### Client (.env)
```env
REACT_APP_API_URL=http://localhost:5000
```

## 🐳 Docker Commands

```bash
# Build and start all services
docker-compose up --build

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Rebuild specific service
docker-compose build server
docker-compose up server
```

## 🧪 Testing the Application

1. **Create a Post**
   - Click "New Post" button
   - Fill in title and content
   - Submit

2. **View Posts**
   - Browse all posts on the home page
   - Sort by "Recent" or "Popular"
   - Click on any post to view details

3. **Interact**
   - Upvote posts (click the up arrow) - one vote per user
   - Add replies to posts
   - Search for posts using the search bar
   - Mark posts as answered (if you're an instructor or post author)
   - View AI-powered similar posts and summaries on post detail pages
   - Toggle dark/light theme using the moon/sun icon
   - Watch real-time updates when other users interact

4. **AI Features** (requires Gemini API key)
   - View similar questions on any post detail page
   - See AI-generated discussion summaries
   - Get key insights from replies automatically

## 📦 Production Build

### Build Frontend
```bash
cd client
npm run build
```

### Run Production Server
```bash
cd server
NODE_ENV=production npm start
```

## 🌟 Future Enhancements

- [ ] Search functionality to filter posts by keyword
- [ ] Mark as Answered feature (Instructor role)
- [ ] AI assistant for similar questions and summaries
- [ ] User authentication (JWT or OAuth)
- [ ] Post categories/tags
- [ ] Rich text editor for posts
- [ ] Image upload support
- [ ] Email notifications

## 📝 License

MIT License - feel free to use this project for the Learnato Hackathon.

## 👥 Contributing

This is a hackathon project. Contributions and improvements are welcome!

## 🐛 Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env` file
- For Docker: ensure mongo service is up (`docker-compose ps`)

**Port Already in Use:**
- Change ports in `docker-compose.yml` or `.env` files
- Kill processes using ports 3000, 5000, or 27017

**Socket.io Connection Issues:**
- Verify `CLIENT_URL` in server `.env` matches frontend URL
- Check CORS settings in `server.js`

**Build Errors:**
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- For Docker: rebuild images: `docker-compose build --no-cache`

## 📞 Support

For issues or questions, please open an issue in the repository.

---

**Built with ❤️ for the Learnato Hackathon**

