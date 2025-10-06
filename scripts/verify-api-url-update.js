/**
 * Script to verify that all references to the old API URL have been updated
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OLD_API_URL = 'http://10.6.0.167:3300';
const NEW_API_URL = 'http://10.6.0.168:30033';

console.log('=== API URL Update Verification ===');
console.log(`Checking for any remaining references to: ${OLD_API_URL}`);

// Function to search for a string in files
function searchInFiles(searchString) {
  try {
    // Use grep or findstr depending on the platform
    const isWindows = process.platform === 'win32';
    const command = isWindows
      ? `findstr /s /i /m "${searchString}" *.js *.ts *.jsx *.tsx *.md *.json`
      : `grep -r "${searchString}" --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" --include="*.md" --include="*.json" .`;
    
    const result = execSync(command, { encoding: 'utf8' });
    return result.trim().split('\n').filter(line => line.trim() !== '');
  } catch (error) {
    // If grep/findstr returns non-zero exit code (no matches), return empty array
    if (error.status === 1) {
      return [];
    }
    console.error('Error searching files:', error.message);
    return [];
  }
}

// Check for old API URL references
const oldApiUrlReferences = searchInFiles(OLD_API_URL);

if (oldApiUrlReferences.length > 0) {
  console.log(`❌ Found ${oldApiUrlReferences.length} references to the old API URL:`);
  oldApiUrlReferences.forEach(reference => console.log(`  - ${reference}`));
  
  console.log('\nFiles that need to be updated:');
  const uniqueFiles = [...new Set(oldApiUrlReferences.map(ref => ref.split(':')[0]))];
  uniqueFiles.forEach(file => console.log(`  - ${file}`));
} else {
  console.log('✅ No references to the old API URL found!');
}

// Verify .env files
const envFiles = ['.env', '.env.local', '.env.production', '.env.development'];
console.log('\n=== Checking Environment Files ===');

envFiles.forEach(envFile => {
  const envPath = path.resolve(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    if (content.includes(OLD_API_URL)) {
      console.log(`❌ ${envFile} still contains the old API URL`);
    } else if (content.includes(NEW_API_URL)) {
      console.log(`✅ ${envFile} is using the new API URL`);
    } else {
      console.log(`⚠️ ${envFile} doesn't contain any API URL reference`);
    }
  } else {
    console.log(`ℹ️ ${envFile} doesn't exist`);
  }
});

console.log('\n=== Verification Complete ===');
