const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

console.log('=== Environment Variable Test ===');
console.log('Current directory:', process.cwd());
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');

// Load .env file
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  console.log('\n📄 Loading .env file from:', envPath);
  dotenv.config({ path: envPath, override: true });
  
  // Read and display the file content
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('\nFile content:');
  console.log(envContent);
} else {
  console.error('❌ .env file not found at:', envPath);
}

// Check if NEXT_PUBLIC_API_URL is set
console.log('\n=== Environment Variables ===');
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL || 'not set');

// Check if the API URL is accessible
if (process.env.NEXT_PUBLIC_API_URL) {
  console.log('\n✅ NEXT_PUBLIC_API_URL is properly set to:', process.env.NEXT_PUBLIC_API_URL);
} else {
  console.error('\n❌ NEXT_PUBLIC_API_URL is not set in the environment!');
  console.log('Please ensure your .env file contains the correct API URL configuration.');
}

// Display all environment variables for debugging
console.log('\n=== All Environment Variables ===');
Object.keys(process.env)
  .filter(key => key.startsWith('NEXT_'))
  .forEach(key => {
    console.log(`${key}: ${process.env[key]}`);
  });

console.log('\n=== Test Complete ===');
