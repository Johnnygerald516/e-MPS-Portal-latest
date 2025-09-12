const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Disable telemetry which might be causing permission issues
process.env.NEXT_TELEMETRY_DISABLED = '1';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3001; // Use port 3001 since 3000 seems to be in use

// Configure the Next.js app with options to avoid permission issues
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
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true);
      
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
