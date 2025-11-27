/**
 * DOM manipulation utilities for the chatbot UI
 */

import { marked } from 'marked';
import type { ChatMessage, Conversation } from './types';

/**
 * Add a message to the chat display
 */
export function addMessage(content: string, sender: 'user' | 'assistant'): HTMLElement {
  const messageList = document.getElementById('message-list');
  if (!messageList) {
    throw new Error('Message list element not found');
  }

  const messageDiv = document.createElement('div');
  const isUser = sender === 'user';

  messageDiv.className = `flex ${isUser ? 'justify-end' : 'justify-start'}`;

  const messageContent = document.createElement('div');
  messageContent.className = `max-w-2xl px-4 py-2 rounded-lg ${
    isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
  }`;

  if (isUser) {
    messageContent.textContent = content;
  } else {
    // Render markdown for assistant messages
    messageContent.innerHTML = marked(content);
    messageContent.classList.add('markdown-content');
  }

  messageDiv.appendChild(messageContent);
  messageList.appendChild(messageDiv);
  scrollToBottom(messageList);

  return messageDiv;
}

/**
 * Create a placeholder message for streaming response
 */
export function createPlaceholderMessage(): { container: HTMLElement; textElement: HTMLElement } {
  const messageList = document.getElementById('message-list');
  if (!messageList) {
    throw new Error('Message list element not found');
  }

  const container = document.createElement('div');
  container.className = 'flex justify-start';

  const textElement = document.createElement('div');
  textElement.className = 'max-w-2xl px-4 py-2 rounded-lg bg-gray-200 text-gray-800 markdown-content';
  textElement.textContent = '...';

  container.appendChild(textElement);
  messageList.appendChild(container);

  scrollToBottom(messageList);
  return { container, textElement };
}

/**
 * Update placeholder message with new text
 */
export function updatePlaceholderMessage(element: HTMLElement, text: string): void {
  // Render markdown while updating
  element.innerHTML = marked(text || '...');
}

/**
 * Scroll chat to bottom
 */
export function scrollToBottom(element: HTMLElement): void {
  element.scrollTop = element.scrollHeight;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Get form elements
 */
export function getFormElements(): {
  form: HTMLFormElement;
  input: HTMLInputElement;
  button: HTMLButtonElement;
} {
  const form = document.getElementById('chat-form') as HTMLFormElement;
  const input = document.getElementById('message-input') as HTMLInputElement;
  const button = document.getElementById('send-button') as HTMLButtonElement;

  if (!form || !input || !button) {
    throw new Error('Required form elements not found');
  }

  return { form, input, button };
}

/**
 * Disable form inputs
 */
export function disableForm(input: HTMLInputElement, button: HTMLButtonElement): void {
  input.disabled = true;
  button.disabled = true;
  button.textContent = 'Sending...';
}

/**
 * Enable form inputs
 */
export function enableForm(input: HTMLInputElement, button: HTMLButtonElement): void {
  input.disabled = false;
  button.disabled = false;
  button.textContent = 'Send';
}

/**
 * Clear input field
 */
export function clearInput(input: HTMLInputElement): void {
  input.value = '';
}

/**
 * Clear all messages from the chat display
 */
export function clearMessages(): void {
  const messageList = document.getElementById('message-list');
  if (messageList) {
    messageList.innerHTML = '';
  }
}

/**
 * Update chat title
 */
export function setChatTitle(title: string): void {
  const chatTitle = document.getElementById('chat-title');
  if (chatTitle) {
    chatTitle.textContent = title;
  }
}

/**
 * Render conversations in sidebar
 */
export function renderConversations(conversations: Conversation[], activeId?: string): void {
  const list = document.getElementById('conversations-list');
  if (!list) return;

  list.innerHTML = '';

  conversations.forEach((conv) => {
    const container = document.createElement('div');
    container.className = 'group relative';

    const button = document.createElement('button');
    button.className = `w-full text-left px-3 py-2 rounded-lg transition-colors ${
      conv.id === activeId
        ? 'bg-blue-600 text-white'
        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
    }`;

    const title = conv.title.length > 20 ? conv.title.substring(0, 20) + '...' : conv.title;
    button.textContent = title;
    button.title = conv.title;
    button.dataset.conversationId = conv.id;

    // Rename button
    const renameBtn = document.createElement('button');
    renameBtn.type = 'button';
    renameBtn.className = `absolute right-2 top-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
      conv.id === activeId
        ? 'bg-blue-700 text-white hover:bg-blue-800'
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    }`;
    renameBtn.innerHTML = '✏️';
    renameBtn.title = 'Rename conversation';
    renameBtn.dataset.conversationId = conv.id;
    renameBtn.dataset.action = 'rename';

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = `absolute right-10 top-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
      conv.id === activeId
        ? 'bg-red-700 text-white hover:bg-red-800'
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    }`;
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.title = 'Delete conversation';
    deleteBtn.dataset.conversationId = conv.id;
    deleteBtn.dataset.action = 'delete';

    container.appendChild(button);
    container.appendChild(renameBtn);
    container.appendChild(deleteBtn);
    list.appendChild(container);
  });
}

/**
 * Get new chat button
 */
export function getNewChatButton(): HTMLButtonElement {
  const btn = document.getElementById('new-chat-btn') as HTMLButtonElement;
  if (!btn) {
    throw new Error('New chat button not found');
  }
  return btn;
}

/**
 * Get conversations list container
 */
export function getConversationsListContainer(): HTMLElement {
  const container = document.getElementById('conversations-list');
  if (!container) {
    throw new Error('Conversations list container not found');
  }
  return container;
}

/**
 * Show rename dialog for conversation
 */
export function showRenameDialog(currentTitle: string): Promise<string | null> {
  return new Promise((resolve) => {
    const newTitle = prompt('Enter new chat name:', currentTitle);
    console.log('Rename dialog result:', newTitle);
    resolve(newTitle);
  });
}
