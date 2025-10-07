/**
 * Script to create a .env file with the necessary environment variables
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Default values
const defaults = {
  NEXT_PUBLIC_API_URL: 'http://127.0.0.1:8000',
  NEXT_PUBLIC_API_URL_FALLBACK: 'http://127.0.0.1:8000',
  NEXT_PUBLIC_TRUSTED_HOSTNAMES: 'localhost,127.0.0.1',
  NEXT_PUBLIC_IMAGE_DOMAINS: '127.0.0.1'
};

// Environment variables to prompt for
const envVars = [
  {
    name: 'NEXT_PUBLIC_API_URL',
    description: 'Main API URL (e.g., http://127.0.0.1:8000)',
    required: true
  },
  {
    name: 'NEXT_PUBLIC_API_URL_FALLBACK',
    description: 'Fallback API URL if main URL is invalid',
    required: false
  },
  {
    name: 'NEXT_PUBLIC_TRUSTED_HOSTNAMES',
    description: 'Comma-separated list of trusted hostnames',
    required: false
  },
  {
    name: 'NEXT_PUBLIC_IMAGE_DOMAINS',
    description: 'Comma-separated list of domains for Next.js Image component',
    required: false
  }
];

// Path to .env file
const envPath = path.resolve(process.cwd(), '.env');

// Check if .env file already exists
if (fs.existsSync(envPath)) {
  console.log('\n.env file already exists at:', envPath);
  rl.question('Do you want to overwrite it? (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      promptForEnvVars();
    } else {
      console.log('Operation cancelled. Existing .env file was not modified.');
      rl.close();
    }
  });
} else {
  promptForEnvVars();
}

// Function to prompt for environment variables
function promptForEnvVars() {
  console.log('\nCreating .env file...');
  console.log('Press Enter to use the default value (shown in brackets).\n');
  
  const envValues = {};
  
  function promptForNextVar(index) {
    if (index >= envVars.length) {
      // All variables have been prompted for
      writeEnvFile(envValues);
      return;
    }
    
    const envVar = envVars[index];
    const defaultValue = defaults[envVar.name] || '';
    const prompt = `${envVar.name} ${envVar.required ? '(required)' : '(optional)'} - ${envVar.description} [${defaultValue}]: `;
    
    rl.question(prompt, (answer) => {
      // Use the provided value or the default
      envValues[envVar.name] = answer.trim() || defaultValue;
      
      // Validate required fields
      if (envVar.required && !envValues[envVar.name]) {
        console.log(`Error: ${envVar.name} is required. Please provide a value.`);
        // Re-prompt for the same variable
        promptForNextVar(index);
      } else {
        // Move to the next variable
        promptForNextVar(index + 1);
      }
    });
  }
  
  // Start prompting for variables
  promptForNextVar(0);
}

// Function to write the .env file
function writeEnvFile(envValues) {
  try {
    let envContent = '# API Configuration\n';
    
    // Add each environment variable to the content
    Object.entries(envValues).forEach(([key, value]) => {
      if (value) {
        envContent += `${key}=${value}\n`;
      }
    });
    
    // Write the file
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ .env file created successfully at:', envPath);
    console.log('\nContent of .env file:');
    console.log(envContent);
    
    console.log('\nYou can now run the application with:');
    console.log('npm run dev-env');
    
  } catch (error) {
    console.error('\n❌ Error creating .env file:', error.message);
  } finally {
    rl.close();
  }
}
