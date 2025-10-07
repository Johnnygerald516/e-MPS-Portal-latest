/** @type {import('next').NextConfig} */

// Load environment variables
const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
console.log('Loading next.config.js with NEXT_PUBLIC_API_URL:', apiUrl);

const nextConfig = {
  reactStrictMode: false,
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
    console.log('Using API URL in headers:', apiUrl);
    
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
    // Get API URL from environment variable or use fallback
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    console.log('Using API URL in rewrites:', apiUrl);
    
    // If no API URL is provided, don't set up rewrites
    if (!apiUrl) {
      console.warn('No API URL provided, skipping rewrites');
      return [];
    }
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
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
