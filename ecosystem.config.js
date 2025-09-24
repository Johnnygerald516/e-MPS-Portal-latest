const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const os = require('os');

// Function to get the server's IP address
const getServerIp = () => {
  const interfaces = os.networkInterfaces();
  let serverIp = '127.0.0.1';
  
  // Look through all network interfaces
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`Found network interface: ${name}, IP: ${iface.address}`);
        // Prefer addresses starting with 10. for internal networks
        if (iface.address.startsWith('10.')) {
          serverIp = iface.address;
          break;
        } else if (!serverIp || serverIp === '127.0.0.1') {
          serverIp = iface.address;
        }
      }
    }
  }
  
  return serverIp;
};

// Get the server's actual IP address
const serverIp = getServerIp();

const projectRoot = "C:/eMPS-Portal2";
const envPath = path.join(projectRoot, '.env.production');

let envConfig = {};
console.log('Looking for .env.production at:', envPath);

if (fs.existsSync(envPath)) {
  console.log('Loading environment variables from .env.production for PM2');
  envConfig = dotenv.parse(fs.readFileSync(envPath));
  console.log('Loaded API URL:', envConfig.NEXT_PUBLIC_API_URL);
} else {
  console.warn('.env.production file not found at:', envPath);
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
        HOST: "0.0.0.0",
        PORT: 3001, // Match your API port
        NEXT_PUBLIC_API_URL: envConfig.NEXT_PUBLIC_API_URL || `http://${serverIp}:3001`,
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