/**
 * Service for handling chatbot feedback
 */

export interface FeedbackData {
  messageId: string;
  isHelpful: boolean;
  comment?: string;
  source?: 'custom_qa' | 'openai';
  timestamp: string;
}

// Storage key for feedback data
const STORAGE_KEY = 'migrant_assistant_feedback';

export const feedbackService = {
  /**
   * Save feedback for a message
   * @param messageId ID of the message receiving feedback
   * @param isHelpful Whether the response was helpful
   * @param comment Optional comment for unhelpful responses
   * @param source Source of the answer (custom_qa or openai)
   * @returns Promise resolving to true if feedback was saved successfully
   */
  saveFeedback: async (messageId: string, isHelpful: boolean, comment?: string, source?: 'custom_qa' | 'openai'): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    
    try {
      // Create new feedback entry
      const newFeedback: FeedbackData = {
        messageId,
        isHelpful,
        comment: comment || undefined, // Only include if provided
        source: source || undefined,
        timestamp: new Date().toISOString()
      };
      
      // Store locally
      const existingData = feedbackService.getAllFeedback();
      const updatedData = [...existingData, newFeedback];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      
      // Send to API endpoint
      try {
        const response = await fetch('/api/chat/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newFeedback),
        });
        
        if (!response.ok) {
          console.warn('Failed to send feedback to API:', await response.text());
        }
      } catch (apiError) {
        // Don't fail if API call fails, just log it
        console.warn('Error sending feedback to API:', apiError);
      }
      
      return true;
    } catch (error) {
      console.error('Error saving feedback:', error);
      return false;
    }
  },
  
  /**
   * Get all collected feedback
   * @returns Array of feedback data
   */
  getAllFeedback: (): FeedbackData[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
      console.error('Error loading feedback:', error);
      return [];
    }
  },
  
  /**
   * Clear all feedback data
   */
  clearAllFeedback: (): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing feedback:', error);
    }
  }
};
