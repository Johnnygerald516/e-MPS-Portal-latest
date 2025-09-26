/**
 * Test script to verify environment variable loading
 * Run with: node scripts/test-env-loading.js
 */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

console.log('=== Environment Variable Test ===');
console.log('Current directory:', process.cwd());
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');

// Test loading .env
try {
  const defaultEnvFile = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(defaultEnvFile)) {
    console.log('\n1. Loading .env from:', defaultEnvFile);
    const defaultEnv = dotenv.parse(fs.readFileSync(defaultEnvFile));
    console.log('   API URL from .env:', defaultEnv.NEXT_PUBLIC_API_URL);
  } else {
    console.log('\n1. .env file not found');
  }
} catch (error) {
  console.error('\n1. Error loading .env:', error);
}

// Test loading .env.production
try {
  const prodEnvFile = path.resolve(process.cwd(), '.env.production');
  if (fs.existsSync(prodEnvFile)) {
    console.log('\n2. Loading .env.production from:', prodEnvFile);
    const prodEnv = dotenv.parse(fs.readFileSync(prodEnvFile));
    console.log('   API URL from .env.production:', prodEnv.NEXT_PUBLIC_API_URL);
  } else {
    console.log('\n2. .env.production file not found');
  }
} catch (error) {
  console.error('\n2. Error loading .env.production:', error);
}

// Test dotenv loading (this will affect process.env)
console.log('\n3. Testing dotenv.config() loading:');
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
console.log('   process.env.NEXT_PUBLIC_API_URL after loading .env:', process.env.NEXT_PUBLIC_API_URL);

// Override with .env.production if it exists
const prodEnvPath = path.resolve(process.cwd(), '.env.production');
if (fs.existsSync(prodEnvPath)) {
  console.log('\n4. Loading .env.production with dotenv.config():');
  dotenv.config({ path: prodEnvPath });
  console.log('   process.env.NEXT_PUBLIC_API_URL after loading .env.production:', process.env.NEXT_PUBLIC_API_URL);
}

console.log('\n=== Test Complete ===');
