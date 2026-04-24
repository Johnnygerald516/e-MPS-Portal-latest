/** @type {import('next').NextConfig} */

// Load environment variables
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const nextConfig = {
  reactStrictMode: false,
  output: 'standalone',
  images: {
    domains: [
      'i.pravatar.cc',
      // Read image domains from environment variables
      ...(process.env.NEXT_PUBLIC_IMAGE_DOMAINS?.split(',') || ['10.6.0.168'])
    ],
  },
  async headers() {
    // Get API URL from environment variable or use fallback
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: apiUrl },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
  // Add API proxy configuration
  async rewrites() {
    // Get API URL from environment variable - respect the protocol as defined in .env
    let apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    // Ensure a protocol is present; default to http:// if missing
    if (apiUrl && !apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
      apiUrl = 'http://' + apiUrl;
    }
    
    // If no API URL is provided, don't set up rewrites
    if (!apiUrl) {
      return [];
    }
    
    return [
      // First, handle the API routes that should be proxied to the external API
      {
        // Use the /api prefix for Next.js API routes
        source: '/api/applications/:path*',
        destination: '/api/applications/:path*',
      },
      {
        // Backward compatibility for /external-api routes
        source: '/external-api/:path*',
        destination: `${apiUrl}/:path*`,
      },
      {
        // Direct external API access - must be last to avoid conflicts with Next.js API routes
        source: '/applications/:path*',
        destination: `${apiUrl}/applications/:path*`,
      },
    ];
  },
  trailingSlash: false,
  generateEtags: false,
  typescript: {
    ignoreBuildErrors: true,
    // Explicitly tell TypeScript to ignore node_modules
    tsconfigPath: './tsconfig.json',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ensure CSS modules are properly processed
  webpack: (config) => {
    // Fix react-redux resolution for recharts
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-redux': require.resolve('react-redux'),
    };
    
    // Push the CSS loader configuration
    const cssRules = config.module.rules
      .find((rule) => typeof rule.oneOf === 'object')
      .oneOf.filter((rule) => Array.isArray(rule.use) && 
        rule.use.some((use) => use && use.loader && use.loader.includes('css-loader')));
    
    if (cssRules) {
      cssRules.forEach((rule) => {
        if (Array.isArray(rule.use)) {
          const cssLoader = rule.use.find((use) => use.loader && use.loader.includes('css-loader'));
          if (cssLoader) {
            cssLoader.options = {
              ...cssLoader.options,
              importLoaders: 1,
            };
          }
        }
      });
    }
    
    return config;
  },
};

module.exports = nextConfig;
