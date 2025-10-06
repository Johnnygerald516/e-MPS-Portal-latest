/**
 * Simple test script for the Migrant Assistant chatbot QA system
 */

// Import the qa-data.json directly
const qaData = require('../src/data/chatbot/qa-data.json');

// Test queries
const testQueries = [
  "how do I apply for a pass?",
  "what documents do I need?",
  "how can I check my application status?",
  "how much does it cost?",
  "how long does processing take?",
  "my application was rejected",
  "I need to extend my stay",
  "can I change from tourist to work permit?",
  "I want to bring my family",
  "I need help",
  "forgot my password",
  "what types of passes are available?"
];

// Simple pattern matching function
function findMatch(query, questions) {
  query = query.toLowerCase();
  
  for (const question of questions) {
    for (const pattern of question.patterns) {
      if (query.includes(pattern.toLowerCase())) {
        return {
          id: question.id,
          pattern: pattern,
          answer: question.answer.substring(0, 50) + '...'
        };
      }
    }
  }
  
  return null;
}

// Run tests
console.log("=== Migrant Assistant Chatbot Simple Test ===\n");

let matchCount = 0;

testQueries.forEach((query, index) => {
  console.log(`Test ${index + 1}: "${query}"`);
  
  const match = findMatch(query, qaData.questions);
  
  if (match) {
    matchCount++;
    console.log(`✅ Matched to: ${match.id}`);
    console.log(`Matched pattern: "${match.pattern}"`);
    console.log(`Answer preview: ${match.answer}\n`);
  } else {
    console.log("❌ No match found\n");
  }
});

console.log(`=== Test Summary ===`);
console.log(`Total queries: ${testQueries.length}`);
console.log(`Matched queries: ${matchCount}`);
console.log(`Match rate: ${((matchCount / testQueries.length) * 100).toFixed(2)}%`);
