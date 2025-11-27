# AI Chatbot Application

A modern, production-ready AI chatbot built with **FastAPI** (server) and **TypeScript + Vite** (client), powered by Google Gemini API.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Docker Deployment](#docker-deployment)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Future Enhancements](#future-enhancements)

## Features

✅ **Real-time Streaming Responses** - Chat responses stream in real-time for better UX
✅ **Multiple Chat Conversations** - Create, manage, and switch between independent chat sessions
✅ **Smart Auto-naming** - Conversations auto-name based on first message, with manual rename support
✅ **Markdown Rendering** - Beautiful formatting for code blocks, lists, tables, and more
✅ **Type-Safe Frontend** - TypeScript for type safety and better developer experience
✅ **Production-Ready Backend** - FastAPI with proper error handling, validation, and logging
✅ **Persistent Storage** - All conversations saved to JSON storage (no database needed)
✅ **CORS Configured** - Secure cross-origin requests
✅ **Environment Configuration** - Flexible configuration with `.env` files
✅ **Docker Support** - Easy deployment with Docker and Docker Compose
✅ **Health Checks** - Built-in health check endpoints
✅ **Input Validation** - Pydantic-based request validation
✅ **Comprehensive Tests** - Unit tests for backend endpoints
✅ **Modern Frontend Build** - Vite for fast development and optimized production builds

## Tech Stack

### Backend
- **Framework:** FastAPI 0.104.1
- **Server:** Uvicorn (ASGI)
- **AI Model:** Google Gemini API (`google-generativeai`)
- **Validation:** Pydantic 2.5.0
- **Testing:** pytest, pytest-asyncio
- **Logging:** Python logging module

### Frontend
- **Language:** TypeScript 5.3.3
- **Build Tool:** Vite 5.0.0
- **Styling:** Tailwind CSS 3.3.6
- **Markdown:** Marked.js for rendering markdown content
- **Type Safety:** Strict TypeScript configuration

### DevOps
- **Containerization:** Docker
- **Orchestration:** Docker Compose
- **Web Server:** Nginx (for client)
- **Reverse Proxy:** Nginx (for API requests)

## Project Structure

```
chatbot/
├── server/                    # Backend API server
│   ├── main.py              # FastAPI application
│   ├── requirements.txt      # Python dependencies
│   ├── test_main.py         # Unit tests
│   └── .env.example         # Environment variables template
├── client/                    # Frontend application
│   ├── index.html           # HTML entry point
│   ├── package.json         # npm dependencies
│   ├── tsconfig.json        # TypeScript configuration
│   ├── vite.config.ts       # Vite configuration
│   ├── src/
│   │   ├── main.ts          # Application entry point
│   │   ├── api.ts           # API client with streaming support
│   │   ├── dom.ts           # DOM manipulation utilities
│   │   ├── types.ts         # TypeScript type definitions
│   │   └── style.css        # Custom styles
│   └── .env.example         # Environment variables template
├── docker-compose.yml        # Docker Compose configuration
├── Dockerfile.server        # Backend Docker image
├── Dockerfile.client        # Frontend Docker image
├── nginx.conf              # Nginx configuration for reverse proxy
├── SPECIFICATION.md        # Original project specification
└── README.md               # This file
```

## Prerequisites

### Local Development
- **Python 3.11+** - For backend
- **Node.js 20+** - For frontend
- **npm 10+** - Package manager for frontend

### Docker Deployment
- **Docker 20.10+**
- **Docker Compose 2.0+**

### API Requirements
- **Google Gemini API Key** - Get it from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Installation

### Clone and Setup

```bash
# Navigate to the chatbot directory
cd chatbot

# Create .env files
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### Backend Setup

```bash
# Navigate to server directory
cd server

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Frontend Setup

```bash
# Navigate to client directory
cd client

# Install npm dependencies
npm install
```

## Configuration

### Backend Configuration (.env)

Create `server/.env` with the following variables:

```env
# Required
GEMINI_API_KEY=your_gemini_api_key_here

# Optional (defaults provided)
GEMINI_MODEL=gemini-1.5-flash
HOST=0.0.0.0
PORT=8000
ALLOWED_ORIGINS=http://localhost:5500,http://localhost:3000
```

**Environment Variables:**
- `GEMINI_API_KEY` - Your Google Gemini API key (required)
- `GEMINI_MODEL` - Model to use (default: `gemini-1.5-flash`)
- `ALLOWED_ORIGINS` - Comma-separated list of allowed origins for CORS
- `HOST` - Server host (default: `0.0.0.0`)
- `PORT` - Server port (default: `8000`)

### Frontend Configuration (.env)

Create `client/.env`:

```env
VITE_API_URL=http://localhost:8000
```

## Running the Application

### Local Development (without Docker)

#### Terminal 1 - Start Backend Server

```bash
cd server

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# or
.\venv\Scripts\activate   # Windows

# Run the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at: `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

#### Terminal 2 - Start Frontend Development Server

```bash
cd client

# Install dependencies if not done
npm install

# Start development server
npm run dev
```

The frontend will be available at: `http://localhost:5500`

### Docker Deployment

```bash
# Build and start all services
docker-compose up --build

# In detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Service URLs:**
- Frontend: `http://localhost:5500`
- Backend API: `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`

## API Documentation

### Health Check

```
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "model": "gemini-2.0-flash"
}
```

### Conversations

#### Create Conversation
```
POST /conversations
Content-Type: application/json

{
  "title": "My Chat"
}
```

**Response:**
```json
{
  "id": "uuid-here",
  "title": "My Chat",
  "created_at": "2025-11-27T19:48:00",
  "messages": []
}
```

#### List Conversations
```
GET /conversations
```

**Response:**
```json
{
  "conversations": [
    {
      "id": "uuid",
      "title": "My Chat",
      "created_at": "2025-11-27T19:48:00",
      "messages": [...]
    }
  ]
}
```

#### Get Conversation
```
GET /conversations/{conversation_id}
```

#### Update Conversation (Rename)
```
PUT /conversations/{conversation_id}
Content-Type: application/json

{
  "title": "New Title"
}
```

#### Delete Conversation
```
DELETE /conversations/{conversation_id}
```

### Chat Endpoint

```
POST /chat
Content-Type: application/json

{
  "prompt": "What is machine learning?",
  "conversation_id": "optional-uuid"
}
```

**Response:** Streaming text/plain response

**Example with curl:**
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello!", "conversation_id": "uuid-here"}'
```

**Interactive API Docs:**
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Testing

### Run Backend Tests

```bash
cd server

# Install test dependencies (included in requirements.txt)
pip install -r requirements.txt

# Run tests
pytest test_main.py -v

# Run with coverage
pytest test_main.py --cov=. --cov-report=html
```

**Test Coverage:**
- Health check endpoint
- Chat endpoint with valid/invalid prompts
- Request validation
- CORS configuration
- Error handling

### Frontend Testing (Future)

```bash
cd client
npm run test  # When test setup is added
```

## Troubleshooting

### Backend Issues

#### "GEMINI_API_KEY environment variable not set"
- Solution: Create `.env` file in `server/` directory with your API key
- Reference: `server/.env.example`

#### "Connection refused" when accessing API
- Solution: Ensure backend is running on port 8000
- Check: `uvicorn main:app --reload --port 8000`

#### CORS errors in browser
- Solution: Update `ALLOWED_ORIGINS` in `server/.env`
- Example: `ALLOWED_ORIGINS=http://localhost:5500,http://localhost:3000`

### Frontend Issues

#### "Cannot find module" TypeScript errors
- Solution: Ensure all dependencies are installed
- Fix: `cd client && npm install`

#### API requests fail with 404
- Solution: Check that `VITE_API_URL` is correct in `client/.env`
- Default: `http://localhost:8000`

#### Port already in use
- Solution: Change port in configuration
- Backend: `uvicorn main:app --port 8001`
- Frontend: `npm run dev -- --port 5501`

### Docker Issues

#### Containers won't start
- Solution: Check environment variables in `docker-compose.yml`
- Ensure `GEMINI_API_KEY` is set in `.env`

#### API connection fails inside Docker
- Solution: Use service name `http://server:8000` instead of `localhost`
- Update nginx.conf accordingly

## Future Enhancements

### Phase 1 - User Management
- [ ] User authentication (OAuth2 / JWT)
- [ ] User sessions and chat history persistence
- [ ] User profiles and preferences

### Phase 2 - Advanced Features
- [ ] Conversation history/context management
- [ ] Multiple AI models support
- [ ] Conversation export (PDF, JSON, etc.)
- [ ] Rate limiting and usage analytics
- [ ] Chat search and filtering

### Phase 3 - Scaling
- [ ] Database integration (PostgreSQL)
- [ ] Caching layer (Redis)
- [ ] Message queue (Celery/RabbitMQ)
- [ ] Kubernetes deployment manifests
- [ ] Load balancing and auto-scaling

### Phase 4 - Developer Experience
- [ ] Frontend unit and integration tests
- [ ] E2E testing (Playwright/Cypress)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] API rate limiting
- [ ] Request logging and monitoring

## Development Guidelines

### Code Style
- **Backend:** Follow PEP 8, use type hints
- **Frontend:** Use strict TypeScript, ESLint recommended

### Commits
- Use clear, descriptive commit messages
- Follow conventional commits when possible
- Example: `feat: add chat streaming`, `fix: CORS configuration`

### Pull Requests
- Include description of changes
- Add tests for new features
- Update documentation as needed

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or suggestions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review existing issues
3. Create a new issue with detailed description

---

**Built with ❤️ using FastAPI and TypeScript**
