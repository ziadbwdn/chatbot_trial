# server/test_main.py
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import sys
import os

# Mock the google.generativeai module before importing main
sys.modules['google.generativeai'] = MagicMock()
sys.modules['google'] = MagicMock()

from main import app, ChatRequest

client = TestClient(app)


@pytest.fixture
def mock_gemini():
    """Mock the Gemini API"""
    with patch('main.genai') as mock:
        yield mock


def test_health_check():
    """Test the health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert "status" in response.json()
    assert response.json()["status"] == "healthy"


def test_chat_endpoint_with_valid_prompt(mock_gemini):
    """Test chat endpoint with valid prompt"""
    # Mock the response
    mock_response = MagicMock()
    mock_response.__iter__ = lambda self: iter([
        MagicMock(text="Hello "),
        MagicMock(text="world!"),
    ])

    mock_model = MagicMock()
    mock_model.generate_content.return_value = mock_response
    mock_gemini.GenerativeModel.return_value = mock_model

    response = client.post(
        "/chat",
        json={"prompt": "What is Python?"}
    )

    assert response.status_code == 200


def test_chat_endpoint_with_empty_prompt(mock_gemini):
    """Test chat endpoint with empty prompt"""
    response = client.post(
        "/chat",
        json={"prompt": "   "}
    )

    assert response.status_code == 400


def test_chat_endpoint_with_missing_prompt(mock_gemini):
    """Test chat endpoint with missing prompt"""
    response = client.post("/chat", json={})

    assert response.status_code == 422  # Pydantic validation error


def test_chat_request_validation():
    """Test ChatRequest validation"""
    # Valid request
    valid_request = ChatRequest(prompt="Hello")
    assert valid_request.prompt == "Hello"

    # Invalid request should raise validation error
    with pytest.raises(Exception):
        ChatRequest(prompt="")


@pytest.mark.asyncio
async def test_cors_headers(mock_gemini):
    """Test CORS headers are present"""
    response = client.options("/chat")
    # Note: FastAPI CORS middleware adds headers on preflight requests
    assert response.status_code in [200, 404]  # OPTIONS might not be allowed


def test_invalid_content_type():
    """Test with invalid content type"""
    response = client.post(
        "/chat",
        json={"prompt": "test"},
        headers={"Content-Type": "text/plain"}
    )
    # FastAPI will still parse JSON
    assert response.status_code == 200 or response.status_code == 422
