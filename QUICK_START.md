# Quick Start Guide

Get the chatbot running in 5 minutes!

## Prerequisites

- **Python 3.11+** and **Node.js 20+** (for local development)
- OR **Docker & Docker Compose** (for containerized setup)
- **Google Gemini API Key** - Get it free from [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

---

## Option 1: Local Development (Fastest)

### Step 1: Get API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key

### Step 2: Backend Setup
```bash
# Navigate to server directory
cd server

# Create virtual environment
python -m venv venv

# Activate it
source venv/bin/activate          # macOS/Linux
# or
.\venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env and add your API key
# Windows: notepad .env
# macOS/Linux: nano .env
# Add: GEMINI_API_KEY=your_api_key_here

# Start server
uvicorn main:app --reload
```

Backend runs at: `http://localhost:8000`
API docs available at: `http://localhost:8000/docs`

### Step 3: Frontend Setup (New Terminal)
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend opens automatically at: `http://localhost:5500`

### Step 4: Use the Chatbot
- Type a message in the input field
- Click "Send" or press Enter
- Watch the AI response stream in real-time

✅ **Done!** Your chatbot is running locally.

---

## Option 2: Docker Deployment (Recommended for Production)

### Step 1: Create .env File
```bash
# In the chatbot root directory
cp server/.env.example server/.env

# Edit server/.env
# Add your GEMINI_API_KEY
```

### Step 2: Start Everything
```bash
# Build and start all services
docker-compose up --build

# In detached mode (runs in background)
docker-compose up -d --build
```

### Step 3: Access the Application
- **Frontend:** http://localhost:5500
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

### Step 4: View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f server
docker-compose logs -f client
```

### Step 5: Stop Services
```bash
docker-compose down
```

✅ **Done!** Your chatbot is running in containers.

---

## Testing

### Backend Tests
```bash
cd server
pytest test_main.py -v
```

### Frontend Tests (Future)
```bash
cd client
npm test  # When configured
```

---

## Troubleshooting

### "GEMINI_API_KEY not set"
**Solution:** Create `server/.env` with your API key
```bash
cd server
cp .env.example .env
# Edit .env and add: GEMINI_API_KEY=your_key_here
```

### "Connection refused" / "Cannot connect to localhost:8000"
**Solution:** Ensure backend is running
```bash
cd server && uvicorn main:app --reload
```

### "Port already in use"
**Solution:** Change port in startup command
```bash
# Backend on different port
uvicorn main:app --port 8001

# Frontend on different port
npm run dev -- --port 5501
```

### "Cannot find module" errors
**Solution:** Install dependencies
```bash
cd client && npm install
```

### Docker issues
**Solution:** Check GEMINI_API_KEY is in `server/.env`
```bash
docker-compose logs server  # View error logs
docker-compose down -v      # Clean up and restart
docker-compose up --build   # Rebuild from scratch
```

---

## API Endpoints

### Health Check
```bash
curl http://localhost:8000/health
```

Response:
```json
{"status": "healthy", "model": "gemini-1.5-flash"}
```

### Chat (Streaming)
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is AI?"}'
```

### API Documentation
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## File Structure Quick Reference

```
chatbot/
├── server/              👈 Backend (Python/FastAPI)
│   ├── main.py         (API server)
│   ├── test_main.py    (Tests)
│   └── .env.example    (Config template)
├── client/              👈 Frontend (TypeScript)
│   ├── src/
│   │   ├── main.ts     (Entry point)
│   │   ├── api.ts      (API client)
│   │   └── types.ts    (Type definitions)
│   └── package.json    (Dependencies)
├── docker-compose.yml   👈 Docker setup
└── README.md           👈 Full documentation
```

---

## Next Steps

After getting it running:

1. **Explore the API** - Visit `http://localhost:8000/docs`
2. **Read the docs** - Check `README.md` for detailed setup
3. **Try the UI** - Chat with the bot at `http://localhost:5500`
4. **Review code** - Understand the structure in `PROJECT_STRUCTURE.md`
5. **Deploy** - See `DEPLOYMENT.md` for production deployment

---

## Common Commands

```bash
# Backend startup
cd server && source venv/bin/activate && uvicorn main:app --reload

# Frontend startup
cd client && npm run dev

# Build frontend for production
cd client && npm run build

# Run tests
cd server && pytest test_main.py -v

# Docker startup
docker-compose up --build

# Docker stop
docker-compose down
```

---

## Need Help?

- 📖 **Setup issues?** → See `README.md`
- 🚀 **Deployment?** → See `DEPLOYMENT.md`
- 🔄 **Migration?** → See `MIGRATION_GUIDE.md`
- 📊 **What changed?** → See `REFACTORING_SUMMARY.md`
- 📁 **File structure?** → See `PROJECT_STRUCTURE.md`

---

**Happy coding! 🚀**
