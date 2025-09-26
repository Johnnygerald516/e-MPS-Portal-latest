/**
 * Simple script to verify environment variables
 */
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });

console.log('=== Environment Variables Check ===');
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);

// Validate URL format
try {
  const url = new URL(process.env.NEXT_PUBLIC_API_URL);
  console.log('✅ URL format is valid');
  console.log('Protocol:', url.protocol);
  console.log('Hostname:', url.hostname);
  console.log('Port:', url.port || 'default');
  console.log('Full URL:', url.toString());
} catch (error) {
  console.error('❌ Invalid URL format:', error.message);
}

// Check if .env file exists
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  console.log('\nContent of .env file:');
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log(envContent);
} else {
  console.error('❌ .env file not found');
}
