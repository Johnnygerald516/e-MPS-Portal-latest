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


// Always load .env file first
try {
  const defaultEnvFile = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(defaultEnvFile)) {
    dotenv.config({ path: defaultEnvFile, override: true });
  }
} catch (error) {
}

if (process.env.NODE_ENV === 'production') {
  try {
    const envFile = path.resolve(process.cwd(), '.env.production');
    if (fs.existsSync(envFile)) {
      dotenv.config({ path: envFile, override: true });
    } else {
    }
  } catch (error) {
  }
}

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3001;

// Get the server's local IP address for display purposes only
const localIp = getLocalIpForDisplay();

// Use the configured API URL or exit if not defined
if (!process.env.NEXT_PUBLIC_API_URL) {
  process.exit(1);
}



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
    },
    webpack: (config) => {
      // Disable file watching to prevent scanning entire drive
      config.watchOptions = {
        ignored: '**/',
      };
      return config;
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
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(port, hostname, (err) => {
    if (err) throw err;
  });
});