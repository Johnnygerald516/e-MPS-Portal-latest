/**
 * Script to update the .env file with LOOKUP_API_URL
 */
const fs = require('fs');
const path = require('path');

// Path to .env file
const envPath = path.resolve(process.cwd(), '.env');

// Check if .env file exists
if (!fs.existsSync(envPath)) {
  console.error('\n❌ .env file not found at:', envPath);
  console.log('Please run npm run create-env first to create the .env file.');
  process.exit(1);
}

// Read the current .env file
console.log('Reading current .env file...');
const envContent = fs.readFileSync(envPath, 'utf8');
console.log('Current .env content:');
console.log(envContent);

// Check if LOOKUP_API_URL already exists
if (envContent.includes('LOOKUP_API_URL=')) {
  console.log('\nLOOKUP_API_URL already exists in .env file.');
  
  // Update the LOOKUP_API_URL to point to 127.0.0.1:8000
  const updatedContent = envContent.replace(
    /LOOKUP_API_URL=.*/g,
    'LOOKUP_API_URL=http://127.0.0.1:8000'
  );
  
  // Write the updated content back to the .env file
  fs.writeFileSync(envPath, updatedContent);
  console.log('\n✅ Updated LOOKUP_API_URL in .env file to http://127.0.0.1:8000');
} else {
  // Add LOOKUP_API_URL to the .env file
  const updatedContent = envContent + '\n# Lookup API URL\nLOOKUP_API_URL=http://127.0.0.1:8000\n';
  
  // Write the updated content back to the .env file
  fs.writeFileSync(envPath, updatedContent);
  console.log('\n✅ Added LOOKUP_API_URL=http://127.0.0.1:8000 to .env file');
}

console.log('\nUpdated .env content:');
console.log(fs.readFileSync(envPath, 'utf8'));

console.log('\nNow updating the lookup API route to use LOOKUP_API_URL...');
