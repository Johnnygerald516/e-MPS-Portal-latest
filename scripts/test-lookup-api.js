/**
 * Script to test the lookup API
 */
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  console.log('Loading .env file');
  dotenv.config({ path: envPath });
} else {
  console.warn('No .env file found');
}

// Get API URL from environment
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
if (!apiUrl) {
  console.error('NEXT_PUBLIC_API_URL is not defined in environment variables');
  process.exit(1);
}

console.log('Using API URL:', apiUrl);

// Test payload
const payload = {
  operationType: "OccupationType",
  argument1: 1,
  argument2: 0
};

// Test direct API call
async function testDirectApi() {
  try {
    console.log('\nTesting direct API call to external API...');
    console.log(`URL: ${apiUrl}/applications/lookup`);
    
    const response = await axios.post(`${apiUrl}/applications/lookup`, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    
    console.log('Direct API call successful!');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    return true;
  } catch (error) {
    console.error('Direct API call failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received');
    } else {
      console.error('Error:', error.message);
    }
    return false;
  }
}

// Test Next.js API route
async function testNextJsApi() {
  try {
    console.log('\nTesting Next.js API route...');
    console.log('URL: http://localhost:3001/api/applications/lookup');
    
    const response = await axios.post('http://localhost:3001/api/applications/lookup', payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    
    console.log('Next.js API route call successful!');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    return true;
  } catch (error) {
    console.error('Next.js API route call failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received');
    } else {
      console.error('Error:', error.message);
    }
    return false;
  }
}

// Run the tests
async function runTests() {
  const directApiResult = await testDirectApi();
  console.log('\nDirect API test result:', directApiResult ? 'SUCCESS' : 'FAILED');
  
  console.log('\nWaiting 2 seconds before testing Next.js API route...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const nextJsApiResult = await testNextJsApi();
  console.log('\nNext.js API route test result:', nextJsApiResult ? 'SUCCESS' : 'FAILED');
  
  if (directApiResult && nextJsApiResult) {
    console.log('\n✅ All tests passed! The lookup API is working correctly.');
  } else {
    console.error('\n❌ Some tests failed. Please check the error messages above.');
  }
}

runTests();
