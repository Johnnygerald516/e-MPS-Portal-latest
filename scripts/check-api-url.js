// Simple script to check the API URL
require('dotenv').config();

console.log('=== API URL Check ===');
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);

try {
  const url = new URL(process.env.NEXT_PUBLIC_API_URL);
  console.log('URL is valid:');
  console.log('- Protocol:', url.protocol);
  console.log('- Hostname:', url.hostname);
  console.log('- Port:', url.port);
  console.log('- Full URL:', url.toString());
} catch (error) {
  console.error('Invalid URL format:', error.message);
}
