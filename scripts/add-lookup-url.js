/**
 * Simple script to add LOOKUP_API_URL to .env file
 */
const fs = require('fs');
const path = require('path');

// Path to .env file
const envPath = path.resolve(process.cwd(), '.env');

// Check if .env file exists
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found at:', envPath);
  process.exit(1);
}

// Read the current .env file
let envContent = fs.readFileSync(envPath, 'utf8');
console.log('Current .env content:');
console.log(envContent);

// Check if LOOKUP_API_URL already exists
if (envContent.includes('LOOKUP_API_URL=')) {
  // Update the existing LOOKUP_API_URL
  envContent = envContent.replace(
    /LOOKUP_API_URL=.*/g,
    'LOOKUP_API_URL=http://127.0.0.1:8000'
  );
  console.log('✅ Updated existing LOOKUP_API_URL to http://127.0.0.1:8000');
} else {
  // Add LOOKUP_API_URL to the .env file
  envContent += '\n# Lookup API URL for verification endpoints\nLOOKUP_API_URL=http://127.0.0.1:8000\n';
  console.log('✅ Added LOOKUP_API_URL=http://127.0.0.1:8000 to .env file');
}

// Write the updated content back to the .env file
fs.writeFileSync(envPath, envContent);

console.log('\nUpdated .env content:');
console.log(fs.readFileSync(envPath, 'utf8'));

console.log('\n✅ LOOKUP_API_URL has been set to http://127.0.0.1:8000');
