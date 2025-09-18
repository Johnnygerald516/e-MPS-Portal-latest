/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['i.pravatar.cc'],
  },
  trailingSlash: false,
  generateEtags: false,
  typescript: {
    ignoreBuildErrors: true,
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
