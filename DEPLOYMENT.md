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

1. Build the Docker image with API endpoint:
   ```bash
   docker build --build-arg NEXT_PUBLIC_API_URL=http://10.6.0.168:30033 -t migrant-fe-portal:v0.0.4 .
   ```

2. Run the Docker container:
   ```bash
   docker run -p 3100:3100 migrant-fe-portal:v0.0.4
   ```

3. Access the application at http://localhost:3100

### Option 3: Private Registry Deployment

1. Build and tag the Docker image for the private registry:
   ```bash
   docker build --build-arg NEXT_PUBLIC_API_URL=http://10.6.0.168:30033 -t 10.6.0.157:30000/migrant-fe-portal:v0.0.4 .
   ```

2. Push the image to the private registry:
   ```bash
   docker push 10.6.0.157:30000/migrant-fe-portal:v0.0.4
   ```

3. Or use the provided PowerShell script:
   ```powershell
   ./docker-build-push.ps1
   ```

### Option 4: Kubernetes Deployment

1. Deploy to Kubernetes using the provided manifests:
   ```bash
   kubectl apply -f kubernetes/deployment.yaml
   kubectl apply -f kubernetes/service.yaml
   ```

2. Or use the provided PowerShell script for a complete build, push, and deploy process:
   ```powershell
   ./deploy-to-k8s.ps1
   ```

3. Access the application using the service endpoint (depends on your Kubernetes configuration)

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
- `PORT`: The port on which the application will run (default: 3100)
- `NEXT_PUBLIC_API_URL`: The backend API endpoint (http://10.6.0.168:30033)
- `HOST`: The host to bind to (0.0.0.0 for Docker containers)

## Notes on CSS Processing

The application uses Tailwind CSS with PostCSS for styling. The build process has been configured to ensure proper CSS processing in production environments. If you encounter any styling issues:

1. Clear the `.next` directory and rebuild
2. Ensure all CSS imports use the correct `@tailwind` directives
3. Check that the PostCSS configuration is correct
4. Verify that the webpack configuration in `next.config.js` is properly handling CSS files
