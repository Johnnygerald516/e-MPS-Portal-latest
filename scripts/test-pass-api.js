// Test script to check the pass API connection
const axios = require('axios');
require('dotenv').config();

// Get the API URL from environment variables
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const applicationId = process.argv[2] || '123456'; // Default application ID or pass as argument

if (!apiUrl) {
  console.error('Error: NEXT_PUBLIC_API_URL is not set in environment variables');
  process.exit(1);
}

console.log(`Testing API connection to: ${apiUrl}`);
console.log(`Testing endpoint: ${apiUrl}/applications/${applicationId}/pass`);

// Test the API connection
async function testApiConnection() {
  try {
    console.log('Sending request...');
    const response = await axios.get(`${apiUrl}/applications/${applicationId}/pass`, {
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('Error connecting to API:');
    
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:');
      console.error('  Code:', error.code);
      console.error('  Message:', error.message);
      
      if (error.response) {
        console.error('  Response status:', error.response.status);
        console.error('  Response data:', error.response.data);
      }
      
      if (error.config) {
        console.error('  Request URL:', error.config.url);
        console.error('  Request method:', error.config.method);
        console.error('  Request headers:', error.config.headers);
      }
    } else {
      console.error(error);
    }
    
    return false;
  }
}

// Run the test
testApiConnection()
  .then(success => {
    if (success) {
      console.log('API connection test successful!');
    } else {
      console.error('API connection test failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
