#!/usr/bin/env node

/**
 * CLI tool to test the Migrant Assistant chatbot QA system
 * Run with: npx ts-node scripts/test-chatbot.js
 */

require('ts-node').register({
  compilerOptions: {
    module: 'commonjs',
    target: 'es2017',
    esModuleInterop: true,
    jsx: 'react-jsx',
    paths: {
      '@/*': ['../src/*']
    }
  }
});

// Run the test
const { runChatbotTest } = require('../src/lib/test-chatbot');
runChatbotTest();
