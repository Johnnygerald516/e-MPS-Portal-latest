const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
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

// Disable telemetry
process.env.NEXT_TELEMETRY_DISABLED = '1';

// Force production mode
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

// Load environment variables
console.log('=== Starting Server ===');
console.log('Current directory:', process.cwd());

if (process.env.NODE_ENV === 'production') {
  try {
    const envFile = path.resolve(process.cwd(), '.env.production');
    if (fs.existsSync(envFile)) {
      console.log('Loading .env.production from:', envFile);
      dotenv.config({ path: envFile });
      console.log('API URL loaded:', process.env.NEXT_PUBLIC_API_URL);
    } else {
      console.warn('.env.production not found at:', envFile);
    }
  } catch (error) {
    console.error('Error loading .env:', error);
  }
}

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3001;

// Get the server's actual IP address
const serverIp = getServerIp();

// Set the API URL to the server's actual IP address
if (!process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL.includes('10.6.0.164')) {
  const apiUrl = `http://${serverIp}:${port}`;
  console.log('Setting API URL to server\'s actual IP:', apiUrl);
  process.env.NEXT_PUBLIC_API_URL = apiUrl;
}

console.log('Server configuration:');
console.log('- Host:', hostname);
console.log('- Port:', port);
console.log('- API URL:', process.env.NEXT_PUBLIC_API_URL);

const app = next({ 
  dev,
  hostname,
  port,
  conf: {
    reactStrictMode: false,
    distDir: '.next-custom',
    typescript: {
      ignoreBuildErrors: true,
    },
    eslint: {
      ignoreDuringBuilds: true,
    }
  }
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(port, hostname, (err) => {
    if (err) throw err;
    console.log('=== Server Ready ===');
    console.log(`> Local: http://localhost:${port}`);
    console.log(`> Network: http://${serverIp}:${port}`);
    console.log(`> API Server: ${process.env.NEXT_PUBLIC_API_URL}`);
  });
});