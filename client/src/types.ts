/**
 * Type definitions for the chatbot application
 */

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  messages: ChatMessage[];
}

export interface ChatRequest {
  prompt: string;
  conversation_id?: string;
}

export interface ChatResponse {
  message: string;
}

export interface ApiError {
  error: string;
  status: number;
}
