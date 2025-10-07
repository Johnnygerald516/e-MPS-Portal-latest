// Development server launcher with environment variables
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Default environment variables
const defaultEnv = {
  NEXT_PUBLIC_API_URL: 'http://127.0.0.1:8000',
  NEXT_PUBLIC_API_URL_FALLBACK: 'http://127.0.0.1:8000',
  NEXT_TELEMETRY_DISABLED: '1',
};

// Try to load .env file if it exists
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    
    envLines.forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match && match[1] && match[2]) {
        const key = match[1].trim();
        const value = match[2].trim();
        if (value) {
          defaultEnv[key] = value;
        }
      }
    });
    
    console.log('Loaded environment variables from .env file');
  } else {
    console.log('No .env file found, using default environment variables');
  }
} catch (error) {
  console.error('Error loading .env file:', error.message);
}

// Log the environment variables being used
console.log('\nUsing environment variables:');
Object.entries(defaultEnv).forEach(([key, value]) => {
  console.log(`${key}=${value}`);
});
console.log('');

// Merge with current environment
const env = { ...process.env, ...defaultEnv };

// Start the Next.js development server
const nextDev = spawn('npx', ['next', 'dev', '--port', '3001'], { 
  env,
  stdio: 'inherit',
  shell: true
});

nextDev.on('close', (code) => {
  console.log(`Next.js dev server exited with code ${code}`);
});

// Handle termination signals
process.on('SIGINT', () => {
  nextDev.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  nextDev.kill('SIGTERM');
  process.exit(0);
});
