const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env');
const envProdPath = path.resolve(process.cwd(), '.env.production');

if (fs.existsSync(envProdPath)) {
  console.log('Loading .env.production');
  dotenv.config({ path: envProdPath });
} else if (fs.existsSync(envPath)) {
  console.log('Loading .env');
  dotenv.config({ path: envPath });
} else {
  console.warn('No .env or .env.production file found');
}

// Get API URL from environment
let apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Check if API URL is defined
if (!apiUrl) {
  console.warn('⚠️ NEXT_PUBLIC_API_URL is not defined in environment variables!');
  console.warn('Using fallback API URL: http://10.6.0.168:30033');
  apiUrl = 'http://10.6.0.168:30033';
}
console.log(`Checking connection to API at: ${apiUrl}`);

// Function to check API connection
async function checkApiConnection() {
  try {
    console.log('Sending request to API...');
    const response = await axios.get(`${apiUrl}/health`, {
      timeout: 5000,
    });
    
    console.log('API Response Status:', response.status);
    console.log('API Response Data:', response.data);
    console.log('✅ API connection successful!');
    return true;
  } catch (error) {
    console.error('❌ API connection failed!');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from API');
      console.error('Request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }
    
    console.error('Error config:', error.config);
    return false;
  }
}

// Try alternative endpoints if health check fails
async function tryAlternativeEndpoints() {
  const endpoints = [
    '/health',
    '/api/health',
    '/',
    '/api'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\nTrying endpoint: ${apiUrl}${endpoint}`);
      const response = await axios.get(`${apiUrl}${endpoint}`, {
        timeout: 5000,
      });
      
      console.log('Status:', response.status);
      console.log('Response:', response.data ? 'Data received' : 'No data');
      console.log('✅ Connection successful!');
      return true;
    } catch (error) {
      console.error(`❌ Failed to connect to ${endpoint}`);
      if (error.response) {
        console.error('Status:', error.response.status);
      } else if (error.request) {
        console.error('No response received');
      } else {
        console.error('Error:', error.message);
      }
    }
  }
  
  return false;
}

// Run the checks
async function runChecks() {
  console.log('=== API Connection Test ===');
  const mainCheck = await checkApiConnection();
  
  if (!mainCheck) {
    console.log('\n=== Trying Alternative Endpoints ===');
    const altCheck = await tryAlternativeEndpoints();
    
    if (!altCheck) {
      console.log('\n=== Network Diagnostics ===');
      console.log('Running ping test...');
      const { exec } = require('child_process');
      
      exec(`ping -n 4 10.6.0.168`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Ping execution error: ${error}`);
          return;
        }
        
        
        if (stderr) {
          console.error(`Ping stderr: ${stderr}`);
        }
        
        console.log('\n=== Recommendations ===');
        console.log('1. Check if the API server is running');
        console.log('2. Verify network connectivity to 10.6.0.168');
        console.log('3. Ensure port 30033 is open and accessible');
        console.log('4. Check firewall settings');
      });
    }
  }
}

runChecks();
