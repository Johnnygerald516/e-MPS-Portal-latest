/**
 * Script to check environment variables and API URL configuration
 */
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });

console.log('=== Environment Variables Check ===');
console.log('Current directory:', process.cwd());
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL || 'not set');

// Check if .env file exists and read its content
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  console.log('\nContent of .env file:');
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log(envContent);
  
  // Parse the .env file
  const envVars = dotenv.parse(envContent);
  console.log('\nParsed environment variables from .env:');
  console.log(envVars);
  
  // Check if NEXT_PUBLIC_API_URL is correctly formatted
  if (envVars.NEXT_PUBLIC_API_URL) {
    try {
      const url = new URL(envVars.NEXT_PUBLIC_API_URL);
      console.log('\n✅ NEXT_PUBLIC_API_URL is a valid URL format');
      console.log('Protocol:', url.protocol);
      console.log('Hostname:', url.hostname);
      console.log('Port:', url.port || 'default');
      console.log('Full URL:', url.toString());
      
      // Try to make a request to the API
      console.log('\nTesting API connection...');
      axios.get(`${envVars.NEXT_PUBLIC_API_URL}/health`, { timeout: 5000 })
        .then(response => {
          console.log('✅ API connection successful!');
          console.log('Status:', response.status);
          console.log('Data:', response.data);
        })
        .catch(error => {
          console.error('❌ API connection failed!');
          if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
          } else if (error.request) {
            console.error('No response received');
          } else {
            console.error('Error:', error.message);
          }
        });
    } catch (error) {
      console.error('\n❌ NEXT_PUBLIC_API_URL is not a valid URL format:', error.message);
    }
  } else {
    console.error('\n❌ NEXT_PUBLIC_API_URL is not defined in .env file');
  }
} else {
  console.error('\n❌ .env file not found at:', envPath);
}

// Check if Next.js can access the environment variables
console.log('\nChecking if Next.js can access environment variables...');
try {
  const nextConfigPath = path.resolve(process.cwd(), 'next.config.js');
  if (fs.existsSync(nextConfigPath)) {
    console.log('✅ next.config.js exists');
    const nextConfig = require(nextConfigPath);
    console.log('Next.js configuration:', nextConfig);
  } else {
    console.error('❌ next.config.js not found');
  }
} catch (error) {
  console.error('Error checking Next.js configuration:', error);
}

// Recommendations
console.log('\n=== Recommendations ===');
console.log('1. Make sure NEXT_PUBLIC_API_URL is correctly set in .env file');
console.log('2. Ensure the API server is running and accessible');
console.log('3. Check that next.config.js is properly configured to use environment variables');
console.log('4. Try restarting the Next.js development server');
console.log('5. Clear the .next cache directory with: rm -rf .next');
