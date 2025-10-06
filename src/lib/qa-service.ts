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
    if (!query || query.trim().length === 0) {
      return null;
    }

    const normalizedQuery = query.toLowerCase().trim();
    let bestMatch: QuestionData | null = null;
    let highestScore = 0;
    
    // Process all questions to find the best match
    for (const question of (qaData as QAData).questions) {
      // Calculate match score for this question
      const score = qaService.calculateMatchScore(normalizedQuery, question);
      
      // Update best match if this score is higher
      if (score > highestScore) {
        highestScore = score;
        bestMatch = question;
      }
    }
    
    // Only return matches with a minimum threshold score
    return highestScore >= 0.5 ? bestMatch : null;
  },
  
  /**
   * Calculate a match score between a query and a question
   * @param query Normalized user query
   * @param question Question data to match against
   * @returns Score between 0 and 1
   */
  calculateMatchScore: (query: string, question: QuestionData): number => {
    let highestPatternScore = 0;
    
    // Check each pattern in the question
    for (const pattern of question.patterns) {
      const normalizedPattern = pattern.toLowerCase();
      
      // Direct inclusion check (highest priority)
      if (query.includes(normalizedPattern)) {
        // Calculate how much of the query is covered by the pattern
        const coverageScore = normalizedPattern.length / query.length;
        highestPatternScore = Math.max(highestPatternScore, 0.7 + (coverageScore * 0.3));
        continue;
      }
      
      // Check if pattern includes query (medium priority)
      if (normalizedPattern.includes(query)) {
        const coverageScore = query.length / normalizedPattern.length;
        highestPatternScore = Math.max(highestPatternScore, 0.6 + (coverageScore * 0.3));
        continue;
      }
      
      // Word-level matching (lower priority)
      const queryWords = query.split(/\s+/).filter(word => word.length > 2);
      const patternWords = normalizedPattern.split(/\s+/).filter(word => word.length > 2);
      
      if (queryWords.length === 0 || patternWords.length === 0) {
        continue;
      }
      
      // Count matching words
      const matchingWords = queryWords.filter(word => 
        patternWords.some(patternWord => 
          patternWord.includes(word) || word.includes(patternWord)
        )
      );
      
      // Calculate word match score
      const wordMatchScore = matchingWords.length / Math.max(queryWords.length, patternWords.length);
      highestPatternScore = Math.max(highestPatternScore, wordMatchScore);
    }
    
    return highestPatternScore;
  },
  
  /**
   * Get an answer for a user query from the custom Q&A data
   * @param query The user's question
   * @returns The answer or null if no match found
   */
  getAnswer: (query: string): string | null => {
    // Check for special commands first
    if (qaService.isHelpCommand(query)) {
      return qaService.getHelpMessage();
    }
    
    const matchingQuestion = qaService.findMatchingQuestion(query);
    return matchingQuestion ? matchingQuestion.answer : null;
  },
  
  /**
   * Check if the query is a help command
   * @param query The user's query
   * @returns True if the query is a help command
   */
  isHelpCommand: (query: string): boolean => {
    const normalizedQuery = query.toLowerCase().trim();
    const helpCommands = ['help', '/help', '?', 'commands', 'what can you do', 'what do you do', 'capabilities'];
    
    return helpCommands.some(cmd => normalizedQuery === cmd);
  },
  
  /**
   * Get a help message with available commands and topics
   * @returns A formatted help message
   */
  getHelpMessage: (): string => {
    const topics = [
      '📝 Application Process - how to apply, start application',
      '📄 Required Documents - what documents do I need',
      '🔍 Application Status - check status, track application',
      '💰 Fees - how much does it cost, payment methods',
      '⏱️ Processing Time - how long, wait time',
      '🔧 Technical Issues - website not working, upload problems',
      '🔄 Appeal Process - application rejected, how to appeal',
      '⏳ Extend Pass - renew pass, stay longer',
      '🔄 Change Pass Type - switch visa, convert pass',
      '👪 Dependents - bring family, spouse visa',
      '🔑 Login Issues - forgot password, account locked',
      '🆘 Help & Support - contact support, helpline'
    ];
    
    return `**I can help with the following topics:**\n\n${topics.join('\n')}\n\nJust ask a question about any of these topics, and I'll provide information based on the eMPS Portal system.`;
  },
  
  /**
   * Get all available questions as an array of patterns
   * Useful for displaying available commands or help
   */
  getAllQuestionPatterns: (): string[] => {
    const patterns: string[] = [];
    for (const question of (qaData as QAData).questions) {
      // Take the first pattern as the representative example
      if (question.patterns.length > 0) {
        patterns.push(question.patterns[0]);
      }
    }
    return patterns;
  },
  
  /**
   * Add a new question and answer to the Q&A data
   * This is just a mock implementation as we can't modify the JSON file directly
   * In a real implementation, this would update the JSON file or database
   */
  addQuestion: (id: string, patterns: string[], answer: string): void => {
    console.log('Adding question is not implemented in this version');
  }
};
