/**
 * Test script for the Migrant Assistant chatbot QA system
 * Run this script to test the pattern matching algorithm and verify answers
 */

import { qaService } from './qa-service';

// Test queries to verify pattern matching
const testQueries = [
  // Direct matches
  "how do I apply for a pass?",
  "what documents do I need for my application?",
  "how can I check my application status?",
  "how much does it cost to apply?",
  
  // Partial matches
  "I want to know about processing times",
  "my application was rejected, what can I do?",
  "I need to extend my stay",
  "can I change from a tourist visa to a work permit?",
  
  // Swahili queries
  "namna ya kujaza ombi",
  "hati zinazohitajika",
  "hali ya maombi yangu",
  "gharama ya kibali",
  
  // Complex queries
  "I'm having trouble uploading my documents to the website",
  "I want to bring my family with me, what do I need to do?",
  "I forgot my password and can't login",
  "what are the different types of passes available?",
  
  // Edge cases
  "hello",
  "thank you",
  "goodbye",
  "what is the weather today?"
];

/**
 * Run the test and display results
 */
export function runChatbotTest() {
  console.log("=== Migrant Assistant Chatbot QA Test ===\n");
  
  let matchCount = 0;
  
  testQueries.forEach((query, index) => {
    console.log(`Test ${index + 1}: "${query}"`);
    
    const matchingQuestion = qaService.findMatchingQuestion(query);
    
    if (matchingQuestion) {
      matchCount++;
      console.log(`✅ Matched to: ${matchingQuestion.id}`);
      console.log(`Score: ${qaService.calculateMatchScore(query.toLowerCase(), matchingQuestion).toFixed(2)}`);
      console.log(`First few words of answer: ${matchingQuestion.answer.substring(0, 50)}...\n`);
    } else {
      console.log("❌ No match found\n");
    }
  });
  
  console.log(`=== Test Summary ===`);
  console.log(`Total queries: ${testQueries.length}`);
  console.log(`Matched queries: ${matchCount}`);
  console.log(`Match rate: ${((matchCount / testQueries.length) * 100).toFixed(2)}%`);
  
  // Test getAllQuestionPatterns
  console.log("\n=== Available Question Patterns ===");
  const patterns = qaService.getAllQuestionPatterns();
  patterns.forEach((pattern, index) => {
    console.log(`${index + 1}. ${pattern}`);
  });
}

// Uncomment to run the test directly
// runChatbotTest();

export default runChatbotTest;
