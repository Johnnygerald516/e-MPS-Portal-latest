/**
 * Script to check all endpoint files for syntax errors
 */
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const endpointDir = path.resolve(process.cwd(), 'src/lib/api/endpoints');
const endpointFiles = fs.readdirSync(endpointDir)
  .filter(file => file.endsWith('.ts') && !file.endsWith('-fixed.ts') && !file.endsWith('.backup'));

console.log('=== Checking Endpoint Files for Syntax Errors ===');
console.log(`Found ${endpointFiles.length} endpoint files to check`);

// Check each file with TypeScript compiler
endpointFiles.forEach(file => {
  const filePath = path.join(endpointDir, file);
  console.log(`\nChecking ${file}...`);
  
  try {
    // Read the file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for common syntax errors
    const errors = [];
    
    // Check for "if (false) // Axios handles errors automatically {"
    if (content.includes('if (false) // Axios handles errors automatically {')) {
      errors.push('Found syntax error: "if (false) // Axios handles errors automatically {"');
    }
    
    // Check for missing imports
    if (content.includes('toast(') && !content.includes('import { toast }')) {
      errors.push('Missing import for toast');
    }
    
    // Check for response.data without axios
    if (content.includes('response.data') && !content.includes('await import(\'../axios\')')) {
      errors.push('Using response.data but not importing axios');
    }
    
    if (errors.length > 0) {
      console.log(`❌ Found ${errors.length} potential issues in ${file}:`);
      errors.forEach(error => console.log(`  - ${error}`));
    } else {
      console.log(`✅ No common syntax errors found in ${file}`);
    }
  } catch (error) {
    console.error(`Error checking ${file}:`, error.message);
  }
});

console.log('\n=== Check Complete ===');
console.log('If any issues were found, please fix them manually or run the fix-endpoints script again.');
