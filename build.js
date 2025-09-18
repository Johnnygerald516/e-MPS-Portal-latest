const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting production build process...');

// Ensure the environment is set to production
process.env.NODE_ENV = 'production';

try {
  // Step 1: Clean previous builds
  console.log('🧹 Cleaning previous builds...');
  if (fs.existsSync(path.join(__dirname, '.next'))) {
    // Use rimraf or native fs methods for cross-platform compatibility
    console.log('Removing .next directory...');
    try {
      // Use Windows-compatible command
      execSync('if exist ".next" rmdir /s /q .next', { stdio: 'inherit' });
    } catch (error) {
      console.warn('Warning: Could not remove .next directory with command. Using manual deletion.');
      // Fallback to manual recursive deletion
      const deleteFolderRecursive = function(path) {
        if (fs.existsSync(path)) {
          fs.readdirSync(path).forEach((file) => {
            const curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) {
              deleteFolderRecursive(curPath);
            } else {
              fs.unlinkSync(curPath);
            }
          });
          fs.rmdirSync(path);
        }
      };
      deleteFolderRecursive(path.join(__dirname, '.next'));
    }
  }

  // Step 2: Install dependencies if needed
  console.log('📦 Checking dependencies...');
  if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
    console.log('Installing dependencies...');
    execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  }

  // Step 3: Build the application
  console.log('🏗️ Building the application...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('✅ Build completed successfully!');
  console.log('To start the application, run: npm run start');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
