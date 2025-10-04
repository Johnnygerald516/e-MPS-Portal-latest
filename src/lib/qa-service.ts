import qaData from '@/data/chatbot/qa-data.json';

export type QuestionData = {
  id: string;
  patterns: string[];
  answer: string;
};

export type QAData = {
  questions: QuestionData[];
};

/**
 * Service to handle custom Q&A functionality for the Migrant Assistant
 */
export const qaService = {
  /**
   * Find the best matching question for a user query
   * @param query The user's question
   * @returns The matching question data or null if no match found
   */
  findMatchingQuestion: (query: string): QuestionData | null => {
    const normalizedQuery = query.toLowerCase().trim();
    
    // Try to find a direct match in patterns
    for (const question of (qaData as QAData).questions) {
      for (const pattern of question.patterns) {
        if (normalizedQuery.includes(pattern.toLowerCase())) {
          return question;
        }
      }
    }
    
    // If no direct match, try to find a partial match
    // This is a simple implementation - could be improved with NLP techniques
    for (const question of (qaData as QAData).questions) {
      for (const pattern of question.patterns) {
        const patternWords = pattern.toLowerCase().split(' ');
        const matchCount = patternWords.filter(word => 
          normalizedQuery.includes(word) && word.length > 3
        ).length;
        
        // If more than half of the words match, consider it a match
        if (patternWords.length > 1 && matchCount >= patternWords.length / 2) {
          return question;
        }
      }
    }
    
    return null;
  },
  
  /**
   * Get an answer for a user query from the custom Q&A data
   * @param query The user's question
   * @returns The answer or null if no match found
   */
  getAnswer: (query: string): string | null => {
    const matchingQuestion = qaService.findMatchingQuestion(query);
    return matchingQuestion ? matchingQuestion.answer : null;
  },
  
  /**
   * Add a new question and answer to the Q&A data
   * This is just a mock implementation as we can't modify the JSON file directly
   * In a real implementation, this would update the JSON file or database
   */
  addQuestion: (id: string, patterns: string[], answer: string): void => {
  }
};
