/**
 * Comprehensive script to fix all fetch calls in endpoint files
 */
const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  console.log(`Processing ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Replace fetch calls with axios calls
  if (content.includes('await fetch(')) {
    console.log('Found fetch calls to replace');
    
    // Replace fetch pattern
    content = content.replace(
      /const response = await fetch\('([^']+)',\s*\{[^}]*method:\s*['"]POST['"][^}]*\}\);/g,
      (match, url) => {
        const endpoint = url.replace('/api/', '');
        return `// Import axios instance
      const api = (await import('../axios')).default;
      const response = await api.post('/${endpoint}', payload);`;
      }
    );
    
    // Fix response handling
    content = content.replace(/if\s*\(\s*!response\.ok\s*\)/g, 'if (false) // Axios handles errors');
    content = content.replace(/await response\.json\(\)/g, 'response.data');
    content = content.replace(/await response\.text\(\)/g, 'response.data');
    
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${filePath}`);
    return true;
  }
  
  return false;
}

const files = [
  'src/lib/api/endpoints/verification.ts',
  'src/lib/api/endpoints/documents.ts',
  'src/lib/api/endpoints/personal-info.ts',
  'src/lib/api/endpoints/parents-info.ts',
  'src/lib/api/endpoints/residence-info.ts',
  'src/lib/api/endpoints/dependant-info.ts'
];

console.log('Starting comprehensive fetch call fix...');

files.forEach(file => {
  const fullPath = path.resolve(process.cwd(), file);
  fixFile(fullPath);
});

console.log('Fix complete!');
