# eMPS-Portal Deployment Guide

This guide provides instructions for deploying the eMPS-Portal application with proper CSS handling.

## Prerequisites

- Node.js 20.x or later
- npm 10.x or later
- Docker (optional, for containerized deployment)

## Local Development

1. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Access the application at http://localhost:3001

## Production Deployment

### Option 1: Standard Deployment

1. Build the application for production:
   ```bash
   npm run build:prod
   ```

2. Start the production server:
   ```bash
   npm run start:prod
   ```

3. Access the application at the configured port (default: 3000)

### Option 2: Docker Deployment

1. Build the Docker image:
   ```bash
   docker build -t emps-portal .
   ```

2. Run the Docker container:
   ```bash
   docker run -p 3100:3100 emps-portal
   ```

3. Access the application at http://localhost:3100

## Troubleshooting CSS Issues

If CSS is not working properly in your deployment:

1. Ensure you're using the production build:
   ```bash
   NODE_ENV=production npm run build
   ```

2. Check that all CSS dependencies are installed:
   ```bash
   npm install autoprefixer postcss tailwindcss --save-dev
   ```

3. Verify that the CSS files are being properly processed by checking the `.next/static/css` directory after building.

4. If using a CDN or reverse proxy, ensure it's not caching old CSS files.

## Environment Variables

- `NODE_ENV`: Set to `production` for production deployments
- `PORT`: The port on which the application will run (default: 3000)
- `API_ENDPOINT`: The backend API endpoint

## Notes on CSS Processing

The application uses Tailwind CSS with PostCSS for styling. The build process has been configured to ensure proper CSS processing in production environments. If you encounter any styling issues:

1. Clear the `.next` directory and rebuild
2. Ensure all CSS imports use the correct `@tailwind` directives
3. Check that the PostCSS configuration is correct
4. Verify that the webpack configuration in `next.config.js` is properly handling CSS files
