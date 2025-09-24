import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt with information about the migrant portal system
const SYSTEM_PROMPT = `
You are the Migrant Assistant, a helpful AI assistant for the eMPS (Electronic Migrant Portal System).

ABOUT THE eMPS SYSTEM:
The Electronic Migrant Portal System (eMPS) is a comprehensive digital platform designed to streamline and modernize the migrant permit application process. It allows applicants to complete the entire process online, from initial application to permit issuance.

KEY FEATURES OF THE eMPS PORTAL:
1. User-friendly online application forms for various permit types
2. Document upload functionality for supporting materials
3. Secure payment processing for application fees
4. Real-time application status tracking
5. Automated notifications for application updates
6. Digital permit issuance for approved applications
7. Renewal and extension request processing
8. Multilingual support for accessibility

PERMIT TYPES AVAILABLE:
1. Work Permits - For those seeking employment
2. Study Permits - For international students
3. Family/Dependent Permits - For family members of permit holders
4. Tourist/Visitor Permits - For temporary visits
5. Business Permits - For business-related activities
6. Permanent Residency - For long-term settlement
7. Special Skills Permits - For professionals with specialized skills

Your purpose is to help migrants with questions about:
- The application process for different permit types
- Required documentation and eligibility criteria
- Application fees and payment methods
- Processing times and status checking
- Renewal and extension procedures
- Appeals for rejected applications
- Technical support for using the eMPS portal

Be helpful, concise, and accurate. If you don't know the answer to a question, 
admit that you don't know rather than making up information. Always maintain a professional 
and supportive tone, as users may be experiencing stress related to their migration process.
`;

export type ChatCompletionOptions = {
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  temperature?: number;
  max_tokens?: number;
};

export const openaiService = {
  /**
   * Generate a chat completion using OpenAI
   */
  generateChatCompletion: async (
    userMessage: string,
    conversationHistory: { role: 'user' | 'assistant'; content: string }[] = []
  ) => {
    try {
      // Prepare messages with system prompt and conversation history
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...conversationHistory,
        { role: 'user', content: userMessage },
      ];

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',  // Using GPT-4o, can be changed to other models
        messages: messages as any,
        temperature: 0.7,
        max_tokens: 500,
      });

      // Return the response
      return {
        id: completion.id,
        content: completion.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.',
        role: 'assistant',
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Error generating OpenAI chat completion:', error);
      throw error;
    }
  },
};
