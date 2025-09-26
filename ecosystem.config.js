const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Get the project root directory
const projectRoot = "C:/eMPS-Portal2";

// First try to load .env.production, then fall back to .env
const prodEnvPath = path.join(projectRoot, '.env.production');
const defaultEnvPath = path.join(projectRoot, '.env');

let envConfig = {};

// Try loading .env.production first (preferred for production)
if (fs.existsSync(prodEnvPath)) {
  console.log('Loading environment variables from .env.production for PM2');
  envConfig = dotenv.parse(fs.readFileSync(prodEnvPath));
  console.log('Loaded API URL from .env.production:', envConfig.NEXT_PUBLIC_API_URL);
} 
// Fall back to .env if .env.production doesn't exist
else if (fs.existsSync(defaultEnvPath)) {
  console.log('Loading environment variables from .env for PM2');
  envConfig = dotenv.parse(fs.readFileSync(defaultEnvPath));
  console.log('Loaded API URL from .env:', envConfig.NEXT_PUBLIC_API_URL);
} else {
  console.warn('No .env or .env.production file found!');
  process.exit(1); // Exit if no environment files found
}

module.exports = {
  apps: [
    {
      name: "eMPS-Portal",
      cwd: projectRoot,
      script: "node",
      args: "server.js",
      env: {
        NODE_ENV: "production",
        HOST: envConfig.HOST || "0.0.0.0",
        PORT: envConfig.PORT || 3001,
        NEXT_PUBLIC_API_URL: envConfig.NEXT_PUBLIC_API_URL,
        NEXT_PUBLIC_API_KEY: envConfig.NEXT_PUBLIC_API_KEY || ""
      },
      watch: false,
      autorestart: true,
      max_memory_restart: "500M",
      error_file: "C:/pm2-logs/nextapp-error.log",
      out_file: "C:/pm2-logs/nextapp-out.log",
      time: true
    }
  ]
};