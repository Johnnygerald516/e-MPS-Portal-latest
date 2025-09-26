const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const os = require('os');

// Function to get the server's local IP address for display purposes only
// This does NOT affect the API_URL configuration
const getLocalIpForDisplay = () => {
  const interfaces = os.networkInterfaces();
  let localIp = '127.0.0.1';
  
  // Look through all network interfaces
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        // Prefer addresses starting with 10. for internal networks
        if (iface.address.startsWith('10.')) {
          localIp = iface.address;
          break;
        } else if (!localIp || localIp === '127.0.0.1') {
          localIp = iface.address;
        }
      }
    }
  }
  
  return localIp;
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

// Always load .env file first
try {
  const defaultEnvFile = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(defaultEnvFile)) {
    console.log('Loading .env from:', defaultEnvFile);
    dotenv.config({ path: defaultEnvFile, override: true });
    console.log('API URL from .env:', process.env.NEXT_PUBLIC_API_URL);
  } else {
    console.warn('No .env file found at:', defaultEnvFile);
  }
} catch (error) {
  console.error('Error loading default .env:', error);
}

if (process.env.NODE_ENV === 'production') {
  try {
    const envFile = path.resolve(process.cwd(), '.env.production');
    if (fs.existsSync(envFile)) {
      console.log('Loading .env.production from:', envFile);
      dotenv.config({ path: envFile, override: true });
      console.log('API URL loaded:', process.env.NEXT_PUBLIC_API_URL);
    } else {
      console.warn('.env.production not found at:', envFile);
    }
  } catch (error) {
    console.error('Error loading .env.production:', error);
  }
}

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3001;

// Get the server's local IP address for display purposes only
const localIp = getLocalIpForDisplay();

// Use the configured API URL or exit if not defined
if (!process.env.NEXT_PUBLIC_API_URL) {
  console.error('❌ NEXT_PUBLIC_API_URL is not defined. Please set it in .env or .env.production before starting the server.');
  process.exit(1);
}
console.log('✅ Using API URL:', process.env.NEXT_PUBLIC_API_URL);


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
    distDir: '.next',
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
    console.log(`> Network: http://${localIp}:${port}`);
    console.log(`> API Server: ${process.env.NEXT_PUBLIC_API_URL}`);
  });
});