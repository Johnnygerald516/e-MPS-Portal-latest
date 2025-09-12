// Real AI chat service that connects to the API

export type ChatMessage = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
};

export const chatService = {
  // Function to get a real AI response from the API
  getResponse: async (message: string): Promise<ChatMessage> => {
    try {
      // Call our API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      // Parse the response
      const data = await response.json();
      
      return {
        id: data.id || Math.random().toString(36).substring(2, 10),
        content: data.content,
        role: 'assistant',
        timestamp: new Date(data.timestamp || Date.now())
      };
    } catch (error) {
      console.error('Error getting chat response:', error);
      
      // Return a fallback message
      return {
        id: 'error-' + Math.random().toString(36).substring(2, 10),
        content: 'Sorry, I had trouble processing that. Please try again.',
        role: 'assistant',
        timestamp: new Date()
      };
    }
  }
};
