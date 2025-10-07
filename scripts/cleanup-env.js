/**
 * Script to clean up LOOKUP_API_URL from .env file
 */
const fs = require('fs');
const path = require('path');

// Path to .env file
const envPath = path.resolve(process.cwd(), '.env');

// Check if .env file exists
if (!fs.existsSync(envPath)) {
  console.error('\n❌ .env file not found at:', envPath);
  process.exit(1);
}

// Read the current .env file
console.log('Reading current .env file...');
let envContent = fs.readFileSync(envPath, 'utf8');

// Check if LOOKUP_API_URL exists in the file
if (envContent.includes('LOOKUP_API_URL=')) {
  console.log('Found LOOKUP_API_URL in .env file, removing it...');
  
  // Remove LOOKUP_API_URL line and any comments above it
  const lines = envContent.split('\n');
  let cleanedLines = [];
  let skipNext = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // If this line is a comment and the next line contains LOOKUP_API_URL, skip both
    if (line.trim().startsWith('#') && i < lines.length - 1 && lines[i + 1].includes('LOOKUP_API_URL=')) {
      skipNext = true;
      continue;
    }
    
    // Skip LOOKUP_API_URL line
    if (skipNext) {
      skipNext = false;
      continue;
    }
    
    // Skip the line if it contains LOOKUP_API_URL
    if (line.includes('LOOKUP_API_URL=')) {
      continue;
    }
    
    cleanedLines.push(line);
  }
  
  // Write the cleaned content back to the .env file
  const cleanedContent = cleanedLines.join('\n');
  fs.writeFileSync(envPath, cleanedContent);
  
  console.log('\n✅ Successfully removed LOOKUP_API_URL from .env file');
  console.log('\nUpdated .env content:');
  console.log(cleanedContent);
} else {
  console.log('\n✅ No LOOKUP_API_URL found in .env file, nothing to clean up');
}

console.log('\nThe lookup API will now use NEXT_PUBLIC_API_URL for all requests.');
