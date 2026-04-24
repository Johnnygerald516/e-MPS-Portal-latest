# Environment Configuration Guide

## Overview

This application uses a **centralized environment configuration** approach. All API URLs and configuration settings are managed through a single `.env` file.

## Quick Start

1. **Copy the example file:**
   ```bash
   cp env.example .env
   ```

2. **Edit `.env` and set your API URL:**
   ```bash
   NEXT_PUBLIC_API_URL=http://your-api-server:port
   ```

3. **Start the application:**
   ```bash
   npm run build
   npm start
   # OR for PM2
   pm2 start ecosystem.config.js
   ```

## Required Environment Variables

### NEXT_PUBLIC_API_URL (REQUIRED)
The base URL for your API server. This is the **SINGLE SOURCE OF TRUTH** for all API calls.

**Examples:**
- Development: `http://localhost:3300`
- Production: `https://api.yourdomain.com`
- Internal Network: `http://10.252.0.4:3300`

**Important Notes:**
- Local URLs (localhost, 127.0.0.1) will keep HTTP protocol
- Production URLs will automatically be converted to HTTPS
- The application will **fail to start** if this is not set

### Optional Variables

- `NEXT_PUBLIC_API_KEY` - API authentication key (if required)
- `HOST` - Server host (default: 0.0.0.0)
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment mode (development/production)
- `NEXT_PUBLIC_IMAGE_DOMAINS` - Comma-separated image domains
- `NEXT_PUBLIC_TRUSTED_HOSTNAMES` - Comma-separated trusted hosts

### Version Control Variables

- `NEXT_PUBLIC_APP_VERSION` - Application version (e.g., 1.0.0)
- `NEXT_PUBLIC_APP_NAME` - Application name (default: eMPS Portal)
- `NEXT_PUBLIC_BUILD_DATE` - Build date (e.g., 2026-03-29)

## Environment Files

### For Different Environments

1. **Development** - `.env` or `.env.local`
2. **Production** - `.env.production`

The application loads environment files in this order:
1. `.env.local` (highest priority)
2. `.env.production` (if NODE_ENV=production)
3. `.env` (default)

## Deployment

### Local Development
```bash
# Create .env file
cp env.example .env

# Edit with your settings
nano .env

# Run development server
npm run dev
```

### Production with PM2
```bash
# Create .env.production
cp env.example .env.production

# Edit with production settings
nano .env.production

# Build and start
npm run build
pm2 start ecosystem.config.js
```

### IIS Deployment
```bash
# On your IIS server, create .env.production in the project root
# Example: C:\inetpub\wwwroot\eMPS-Portal\.env.production

NEXT_PUBLIC_API_URL=https://your-production-api.com
HOST=127.0.0.1
PORT=3001
NODE_ENV=production
```

## Troubleshooting

### Error: "NEXT_PUBLIC_API_URL is not defined"
**Solution:** Create a `.env` file with `NEXT_PUBLIC_API_URL` set.

### API calls failing
**Check:**
1. `.env` file exists in project root
2. `NEXT_PUBLIC_API_URL` is set correctly
3. API server is accessible from your application server
4. No typos in the URL

### Changes not taking effect
**Solution:** Restart the application after changing `.env`:
```bash
# For PM2
pm2 restart eMPS-Portal

# For IIS
# Restart the application pool in IIS Manager
```

## Best Practices

1. **Never commit `.env` files** - They're in `.gitignore` for security
2. **Use `env.example`** - Keep it updated with all required variables
3. **One source of truth** - All API configuration comes from `.env`
4. **Document changes** - Update this file when adding new variables
5. **Validate on startup** - The app will fail fast if required vars are missing

## Migration from Old Configuration

If you had hardcoded URLs in multiple files, they have been removed. Now:
- ✅ Single `.env` file controls all API URLs
- ✅ No hardcoded fallback URLs
- ✅ Clear error messages if configuration is missing
- ✅ Consistent behavior across all environments
