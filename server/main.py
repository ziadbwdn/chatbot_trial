# server/main.py
import os
import json
import uuid
from datetime import datetime
import google.generativeai as genai
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Chatbot API",
    description="AI Chatbot API powered by Google Gemini",
    version="1.0.0"
)

# CORS Configuration
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5500").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini API
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    logger.error("GEMINI_API_KEY environment variable not set.")
    raise ValueError("GEMINI_API_KEY environment variable not set.")

genai.configure(api_key=API_KEY)

# Model Configuration
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

# Conversations storage file
CONVERSATIONS_FILE = "conversations.json"

def load_conversations():
    """Load conversations from JSON file"""
    if os.path.exists(CONVERSATIONS_FILE):
        try:
            with open(CONVERSATIONS_FILE, "r") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading conversations: {e}")
            return {}
    return {}

def save_conversations(conversations):
    """Save conversations to JSON file"""
    try:
        with open(CONVERSATIONS_FILE, "w") as f:
            json.dump(conversations, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving conversations: {e}")

def get_conversations():
    """Get conversations dict, creating if needed"""
    if not hasattr(app.state, "conversations"):
        app.state.conversations = load_conversations()
    return app.state.conversations

# Request/Response Schema
class ChatRequest(BaseModel):
    """Chat request payload"""
    prompt: str
    conversation_id: str = None

    class Config:
        example = {"prompt": "What is the capital of France?"}

class ChatResponse(BaseModel):
    """Chat response payload"""
    message: str

class ConversationCreate(BaseModel):
    """Create conversation request"""
    title: str = "New Chat"

class Message(BaseModel):
    """Message in a conversation"""
    id: str
    content: str
    sender: str
    timestamp: str

class ConversationResponse(BaseModel):
    """Conversation response"""
    id: str
    title: str
    created_at: str
    messages: list[Message] = []

async def generate(prompt: str, conversation_id: str = None):
    """An async generator that streams responses from Gemini."""
    try:
        model = genai.GenerativeModel(GEMINI_MODEL)
        response = model.generate_content(prompt, stream=True)
        full_response = ""
        for chunk in response:
            if chunk.text:
                full_response += chunk.text
                yield chunk.text

        # Save assistant message to conversation after streaming is complete
        if conversation_id:
            conversations = get_conversations()
            if conversation_id in conversations:
                msg = {
                    "id": str(uuid.uuid4()),
                    "content": full_response,
                    "sender": "assistant",
                    "timestamp": datetime.now().isoformat()
                }
                conversations[conversation_id]["messages"].append(msg)
                save_conversations(conversations)
    except Exception as e:
        logger.error(f"Error generating response: {str(e)}")
        yield f"Error: {str(e)}"

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "model": GEMINI_MODEL}

@app.post("/conversations", response_model=ConversationResponse, tags=["Conversations"])
async def create_conversation(request: ConversationCreate):
    """Create a new conversation"""
    conversations = get_conversations()
    conversation_id = str(uuid.uuid4())
    now = datetime.now().isoformat()

    conversations[conversation_id] = {
        "id": conversation_id,
        "title": request.title,
        "created_at": now,
        "messages": []
    }

    save_conversations(conversations)
    logger.info(f"Created conversation: {conversation_id}")
    return conversations[conversation_id]

@app.get("/conversations", tags=["Conversations"])
async def list_conversations():
    """List all conversations"""
    conversations = get_conversations()
    conv_list = list(conversations.values())
    return {"conversations": conv_list}

@app.get("/conversations/{conversation_id}", response_model=ConversationResponse, tags=["Conversations"])
async def get_conversation(conversation_id: str):
    """Get a specific conversation with its messages"""
    conversations = get_conversations()
    if conversation_id not in conversations:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversations[conversation_id]

@app.put("/conversations/{conversation_id}", response_model=ConversationResponse, tags=["Conversations"])
async def update_conversation(conversation_id: str, request: ConversationCreate):
    """Update a conversation (rename)"""
    conversations = get_conversations()
    if conversation_id not in conversations:
        raise HTTPException(status_code=404, detail="Conversation not found")

    conversations[conversation_id]["title"] = request.title
    save_conversations(conversations)
    logger.info(f"Updated conversation {conversation_id} title to: {request.title}")
    return conversations[conversation_id]

@app.delete("/conversations/{conversation_id}", tags=["Conversations"])
async def delete_conversation(conversation_id: str):
    """Delete a conversation"""
    conversations = get_conversations()
    if conversation_id not in conversations:
        raise HTTPException(status_code=404, detail="Conversation not found")

    del conversations[conversation_id]
    save_conversations(conversations)
    logger.info(f"Deleted conversation: {conversation_id}")
    return {"status": "deleted"}

@app.post("/chat", tags=["Chat"])
async def chat_endpoint(request: ChatRequest):
    """
    Chat endpoint that streams responses from Gemini.

    - **prompt**: The user's message/prompt
    - **conversation_id**: Optional conversation ID to add message to

    Returns: Streamed text response from the AI model
    """
    if not request.prompt or not request.prompt.strip():
        logger.warning("Empty prompt received")
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")

    logger.info(f"Received chat request: {request.prompt[:50]}...")

    # Add user message to conversation if conversation_id provided
    if request.conversation_id:
        conversations = get_conversations()
        if request.conversation_id in conversations:
            msg = {
                "id": str(uuid.uuid4()),
                "content": request.prompt,
                "sender": "user",
                "timestamp": datetime.now().isoformat()
            }
            conversations[request.conversation_id]["messages"].append(msg)
            save_conversations(conversations)

    return StreamingResponse(
        generate(request.prompt, request.conversation_id),
        media_type="text/plain"
    )

@app.post("/conversations/{conversation_id}/messages", tags=["Conversations"])
async def add_message(conversation_id: str, message_content: str):
    """Add a message to a conversation"""
    conversations = get_conversations()
    if conversation_id not in conversations:
        raise HTTPException(status_code=404, detail="Conversation not found")

    msg = {
        "id": str(uuid.uuid4()),
        "content": message_content,
        "sender": "assistant",
        "timestamp": datetime.now().isoformat()
    }
    conversations[conversation_id]["messages"].append(msg)
    save_conversations(conversations)

    return msg

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# To run this file: uvicorn main:app --reload
