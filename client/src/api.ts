/**
 * API client for communicating with the backend server
 */

import type { ChatRequest, ApiError, Conversation } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Send a chat message and stream the response
 */
export async function* streamChat(prompt: string, conversationId?: string): AsyncGenerator<string, void, unknown> {
  const request: ChatRequest = { prompt, conversation_id: conversationId };

  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error: ApiError = {
        error: `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
      };
      throw error;
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        yield chunk;
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch chat response: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Check server health
 */
export async function checkHealth(): Promise<{ status: string; model: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to check server health: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Create a new conversation
 */
export async function createConversation(title: string = 'New Chat'): Promise<Conversation> {
  try {
    const response = await fetch(`${API_BASE_URL}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create conversation: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create conversation: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get all conversations
 */
export async function listConversations(): Promise<Conversation[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/conversations`);
    if (!response.ok) {
      throw new Error(`Failed to list conversations: ${response.statusText}`);
    }
    const data = await response.json();
    return data.conversations;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to list conversations: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get a specific conversation
 */
export async function getConversation(conversationId: string): Promise<Conversation> {
  try {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`);
    if (!response.ok) {
      throw new Error(`Failed to get conversation: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get conversation: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Update conversation title
 */
export async function updateConversationTitle(conversationId: string, title: string): Promise<Conversation> {
  try {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update conversation: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to update conversation: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Delete a conversation
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete conversation: ${response.statusText}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to delete conversation: ${error.message}`);
    }
    throw error;
  }
}
