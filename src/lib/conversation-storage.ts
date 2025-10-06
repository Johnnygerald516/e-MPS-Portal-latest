import { ChatMessage } from './chat-service';

// Storage key for conversation history
const STORAGE_KEY = 'migrant_assistant_conversation';

// Maximum number of messages to store
const MAX_STORED_MESSAGES = 20;

/**
 * Service for managing conversation history persistence
 */
export const conversationStorage = {
  /**
   * Save conversation history to localStorage
   * @param messages Array of chat messages to save
   */
  saveConversation: (messages: ChatMessage[]): void => {
    if (typeof window === 'undefined') return;
    
    try {
      // Only store the most recent messages to avoid excessive storage use
      const messagesToStore = messages.slice(-MAX_STORED_MESSAGES);
      
      // Convert Date objects to strings for storage
      const serializedMessages = messagesToStore.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      }));
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializedMessages));
    } catch (error) {
      console.error('Error saving conversation history:', error);
    }
  },
  
  /**
   * Load conversation history from localStorage
   * @returns Array of chat messages or empty array if none found
   */
  loadConversation: (): ChatMessage[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      
      if (!storedData) return [];
      
      // Parse stored data and convert timestamp strings back to Date objects
      const parsedData = JSON.parse(storedData);
      
      return parsedData.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    } catch (error) {
      console.error('Error loading conversation history:', error);
      return [];
    }
  },
  
  /**
   * Clear conversation history from localStorage
   */
  clearConversation: (): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing conversation history:', error);
    }
  },
  
  /**
   * Check if there is a stored conversation
   * @returns True if conversation history exists
   */
  hasStoredConversation: (): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      return !!storedData && storedData !== '[]';
    } catch (error) {
      console.error('Error checking conversation history:', error);
      return false;
    }
  }
};
