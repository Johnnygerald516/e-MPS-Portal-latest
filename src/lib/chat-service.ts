// Chat service that connects to our OpenAI-powered API

export type ChatMessage = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
};

export const chatService = {
  // Function to get an AI response from our API
  getResponse: async (message: string, conversationHistory: ChatMessage[] = []): Promise<ChatMessage> => {
    try {
      // Convert conversation history to the format expected by the API
      const apiConversationHistory = conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Call our API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message,
          conversationHistory: apiConversationHistory 
        }),
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
      return {
        id: 'error-' + Math.random().toString(36).substring(2, 10),
        content: 'Sorry, I had trouble processing that. Please try again.',
        role: 'assistant',
        timestamp: new Date()
      };
    }
  }
};
