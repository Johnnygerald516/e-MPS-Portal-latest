/**
 * Script to clean and restart the Next.js application
 * This script:
 * 1. Clears the Next.js cache directory
 * 2. Reloads environment variables
 * 3. Restarts the development server
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

console.log('=== Clean Restart Script ===');

// Load environment variables
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    console.log('Loading environment variables from:', envPath);
    dotenv.config({ path: envPath, override: true });
    console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL || 'not set');
  } else {
    console.warn('No .env file found at:', envPath);
  }
} catch (error) {
  console.error('Error loading environment variables:', error);
}

// Clean the Next.js cache directory
try {
  console.log('Cleaning Next.js cache directory...');
  const nextDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(nextDir)) {
    console.log('Removing .next directory...');
    // Use rimraf or recursive deletion for cross-platform compatibility
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log('✅ .next directory removed');
  } else {
    console.log('No .next directory found, skipping cleanup');
  }
} catch (error) {
  console.error('Error cleaning Next.js cache:', error);
}

// Check API URL
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
if (!apiUrl) {
  console.error('❌ NEXT_PUBLIC_API_URL is not defined in environment variables!');
  console.log('Please set NEXT_PUBLIC_API_URL in your .env file before continuing.');
  process.exit(1);
}

console.log('Using API URL:', apiUrl);

// Validate API URL format
try {
  const url = new URL(apiUrl);
  console.log('✅ API URL format is valid');
  console.log('Protocol:', url.protocol);
  console.log('Hostname:', url.hostname);
  console.log('Port:', url.port || 'default');
} catch (error) {
  console.error('❌ API URL format is invalid:', error.message);
  console.log('Please fix the API URL format in your .env file before continuing.');
  process.exit(1);
}

// Start the development server
console.log('\nStarting development server...');
try {
  // Use execSync to run the command and display output in real-time
  execSync('npm run dev', { stdio: 'inherit' });
} catch (error) {
  console.error('Error starting development server:', error);
  process.exit(1);
}
