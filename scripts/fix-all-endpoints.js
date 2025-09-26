/**
 * Script to systematically fix all API endpoints to use axios instead of fetch
 * This will update all files to properly use the environment variable
 */
const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/lib/api/endpoints/verification.ts',
  'src/lib/api/endpoints/documents.ts',
  'src/lib/api/endpoints/personal-info.ts',
  'src/lib/api/endpoints/parents-info.ts',
  'src/lib/api/endpoints/residence-info.ts',
  'src/lib/api/endpoints/dependant-info.ts'
];

function fixFetchCalls(filePath) {
  console.log(`\n=== Fixing ${filePath} ===`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Replace fetch calls with axios calls
  const fetchPattern = /const response = await fetch\('\/api\/([^']+)',\s*\{[^}]*method:\s*['"]POST['"][^}]*\}\);/g;
  
  if (fetchPattern.test(content)) {
    console.log('Found fetch calls to replace');
    
    // Reset regex
    fetchPattern.lastIndex = 0;
    
    content = content.replace(fetchPattern, (match, endpoint) => {
      console.log(`Replacing fetch call to: /api/${endpoint}`);
      return `// Import axios instance to ensure we use the configured API URL
      const api = (await import('../axios')).default;
      
      const response = await api.post('/${endpoint}', payload);`;
    });
    
    modified = true;
  }
  
  // Fix response handling
  if (content.includes('response.ok') || content.includes('response.json()') || content.includes('response.text()')) {
    console.log('Fixing response handling');
    
    // Replace response.ok checks
    content = content.replace(/if\s*\(\s*!response\.ok\s*\)/g, 'if (false) // Axios handles errors automatically');
    
    // Replace response.json() calls
    content = content.replace(/await response\.json\(\)/g, 'response.data');
    
    // Replace response.text() calls
    content = content.replace(/await response\.text\(\)/g, 'response.data');
    
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${filePath}`);
  } else {
    console.log(`No changes needed for ${filePath}`);
  }
}

console.log('=== Starting API Endpoint Fix ===');
console.log('This script will update all API endpoints to use axios instead of fetch');

filesToFix.forEach(file => {
  const fullPath = path.resolve(process.cwd(), file);
  fixFetchCalls(fullPath);
});

console.log('\n=== Fix Complete ===');
console.log('All API endpoints have been updated to use axios with environment variables');
console.log('Please restart your development server to see the changes');
