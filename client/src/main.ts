/**
 * Main application entry point
 */

import {
  streamChat,
  checkHealth,
  createConversation,
  listConversations,
  getConversation,
  deleteConversation,
  updateConversationTitle,
} from './api';
import {
  addMessage,
  createPlaceholderMessage,
  updatePlaceholderMessage,
  getFormElements,
  disableForm,
  enableForm,
  clearInput,
  clearMessages,
  setChatTitle,
  renderConversations,
  getNewChatButton,
  getConversationsListContainer,
  showRenameDialog,
} from './dom';
import type { Conversation } from './types';

let currentConversation: Conversation | null = null;
let allConversations: Conversation[] = [];

/**
 * Load all conversations from server
 */
async function loadConversations(): Promise<void> {
  try {
    allConversations = await listConversations();
    renderConversations(allConversations, currentConversation?.id);
  } catch (error) {
    console.error('Failed to load conversations:', error);
  }
}

/**
 * Load and display a specific conversation
 */
async function loadConversation(conversationId: string): Promise<void> {
  try {
    const conversation = await getConversation(conversationId);
    currentConversation = conversation;

    // Update UI
    setChatTitle(conversation.title);
    clearMessages();
    renderConversations(allConversations, conversationId);

    // Display all messages in conversation
    conversation.messages.forEach((msg) => {
      addMessage(msg.content, msg.sender);
    });
  } catch (error) {
    console.error('Failed to load conversation:', error);
    addMessage('Error loading conversation', 'assistant');
  }
}

/**
 * Create a new conversation
 */
async function createNewConversation(): Promise<void> {
  try {
    const newConv = await createConversation('New Chat');
    currentConversation = newConv;
    allConversations.push(newConv);

    // Update UI
    setChatTitle(newConv.title);
    clearMessages();
    renderConversations(allConversations, newConv.id);
  } catch (error) {
    console.error('Failed to create conversation:', error);
    addMessage('Error creating new chat', 'assistant');
  }
}

/**
 * Handle conversation deletion
 */
async function handleDeleteConversation(conversationId: string): Promise<void> {
  try {
    await deleteConversation(conversationId);
    allConversations = allConversations.filter((c) => c.id !== conversationId);

    if (currentConversation?.id === conversationId) {
      if (allConversations.length > 0) {
        await loadConversation(allConversations[0].id);
      } else {
        await createNewConversation();
      }
    } else {
      renderConversations(allConversations, currentConversation?.id);
    }
  } catch (error) {
    console.error('Failed to delete conversation:', error);
  }
}

/**
 * Initialize the chatbot application
 */
async function initializeChatbot(): Promise<void> {
  try {
    // Check server health
    const health = await checkHealth();
    console.log('Server health:', health);
  } catch (error) {
    console.warn('Server health check failed:', error);
  }

  // Load conversations
  await loadConversations();

  // Create initial conversation if none exist
  if (allConversations.length === 0) {
    await createNewConversation();
  } else {
    await loadConversation(allConversations[0].id);
  }

  const { form, input, button } = getFormElements();
  const newChatBtn = getNewChatButton();
  const conversationsList = getConversationsListContainer();

  // New chat button
  newChatBtn.addEventListener('click', async (e: MouseEvent) => {
    e.preventDefault();
    await createNewConversation();
  });

  // Conversation selection and actions
  conversationsList.addEventListener('click', async (e: MouseEvent) => {
    const target = e.target as HTMLElement;

    // Make sure we're clicking a button
    if (target.tagName !== 'BUTTON') return;

    const action = target.dataset.action;
    const conversationId = target.dataset.conversationId;

    if (!conversationId) return;

    console.log('Action:', action, 'ConvID:', conversationId);

    if (action === 'rename') {
      e.preventDefault();
      e.stopPropagation();
      console.log('Rename action triggered for:', conversationId);
      const conversation = allConversations.find((c) => c.id === conversationId);
      console.log('Found conversation:', conversation);
      if (conversation) {
        const newTitle = await showRenameDialog(conversation.title);
        console.log('New title from dialog:', newTitle);
        if (newTitle && newTitle.trim()) {
          try {
            console.log('Updating conversation title to:', newTitle.trim());
            const updated = await updateConversationTitle(conversationId, newTitle.trim());
            console.log('Successfully updated, response:', updated);

            // Update local state
            const convIndex = allConversations.findIndex((c) => c.id === conversationId);
            if (convIndex !== -1) {
              allConversations[convIndex].title = newTitle.trim();
            }

            // Update current conversation if it's the one being renamed
            if (currentConversation && currentConversation.id === conversationId) {
              currentConversation.title = newTitle.trim();
              setChatTitle(newTitle.trim());
            }

            // Re-render sidebar
            renderConversations(allConversations, currentConversation?.id);
          } catch (error) {
            console.error('Failed to rename conversation:', error);
          }
        } else {
          console.log('Title was empty or cancelled');
        }
      }
    } else if (action === 'delete') {
      e.preventDefault();
      e.stopPropagation();
      if (confirm('Are you sure you want to delete this conversation?')) {
        try {
          await handleDeleteConversation(conversationId);
        } catch (error) {
          console.error('Failed to delete conversation:', error);
        }
      }
    } else if (!action) {
      // Regular click - load conversation
      e.preventDefault();
      e.stopPropagation();
      await loadConversation(conversationId);
    }
  });

  // Chat form submission
  form.addEventListener('submit', async (e: SubmitEvent) => {
    e.preventDefault();

    if (!currentConversation) {
      addMessage('No conversation selected', 'assistant');
      return;
    }

    const userMessage = input.value.trim();
    if (!userMessage) return;

    try {
      // Auto-rename conversation on first message if title is "New Chat"
      const isFirstMessage = currentConversation.messages.length === 0;
      if (isFirstMessage && currentConversation.title === 'New Chat') {
        const autoTitle = userMessage.substring(0, 30).trim();
        try {
          await updateConversationTitle(currentConversation.id, autoTitle);
          currentConversation.title = autoTitle;
          setChatTitle(autoTitle);
        } catch (error) {
          console.error('Failed to auto-rename conversation:', error);
        }
      }

      // Add user message to chat
      addMessage(userMessage, 'user');
      clearInput(input);
      disableForm(input, button);

      // Create placeholder for assistant response
      const { textElement, container } = createPlaceholderMessage();

      // Stream the response
      let fullResponse = '';
      for await (const chunk of streamChat(userMessage, currentConversation.id)) {
        fullResponse += chunk;
        updatePlaceholderMessage(textElement, fullResponse || '...');
      }

      if (!fullResponse) {
        updatePlaceholderMessage(textElement, 'No response received.');
      } else {
        // Remove placeholder and add the actual response message
        container.remove();
        addMessage(fullResponse, 'assistant');
      }

      // Reload conversations to update sidebar
      await loadConversations();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Chat error:', error);
      addMessage(`Error: ${errorMessage}`, 'assistant');
    } finally {
      enableForm(input, button);
    }
  });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initializeChatbot().catch((error) => {
    console.error('Failed to initialize chatbot:', error);
  });
});
