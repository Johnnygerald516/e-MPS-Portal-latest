/**
 * Script to fix the LOOKUP_API_URL in .env file
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
let envContent = fs.readFileSync(envPath, 'utf8');

// Check if LOOKUP_API_URL already exists
if (envContent.includes('LOOKUP_API_URL=')) {
  // Update the LOOKUP_API_URL to point to 127.0.0.1:8000/api
  envContent = envContent.replace(
    /LOOKUP_API_URL=.*/g,
    'LOOKUP_API_URL=http://127.0.0.1:8000/api'
  );
  
  // Write the updated content back to the .env file
  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ Updated LOOKUP_API_URL in .env file to http://127.0.0.1:8000/api');
} else {
  // Add LOOKUP_API_URL to the .env file
  envContent += '\n# Lookup API URL for verification endpoints\nLOOKUP_API_URL=http://127.0.0.1:8000/api\n';
  
  // Write the updated content back to the .env file
  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ Added LOOKUP_API_URL=http://127.0.0.1:8000/api to .env file');
}

console.log('\nUpdated .env content:');
console.log(envContent);

console.log('\nNow the lookup API will use http://127.0.0.1:8000/api/lookup instead of http://127.0.0.1:8000/applications/lookup');
console.log('This should prevent the recursive API call error.');
