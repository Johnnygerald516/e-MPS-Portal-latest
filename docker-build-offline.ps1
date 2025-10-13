# Docker build script with offline mode for migrant-fe-portal
# This script builds the Docker image using local node_modules

# Variables
$REGISTRY="10.6.0.157:30000"
$IMAGE_NAME="migrant-fe-portal"
$IMAGE_TAG="v0.0.5"
$FULL_IMAGE_NAME="$REGISTRY/$IMAGE_NAME`:$IMAGE_TAG"
$API_URL="http://10.6.0.168:30033"

# Display information
Write-Host "Building Docker image in offline mode: $FULL_IMAGE_NAME" -ForegroundColor Green
Write-Host "API URL: $API_URL" -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "Error: Docker is not running. Please start Docker and try again." -ForegroundColor Red
    exit 1
}

# Check if node_modules exists locally
if (-not (Test-Path -Path ".\node_modules")) {
    Write-Host "Error: node_modules directory not found. Please run 'npm install' first." -ForegroundColor Red
    Write-Host "Run: npm install --legacy-peer-deps" -ForegroundColor Yellow
    exit 1
}

# Create a temporary Dockerfile for offline build
$offlineDockerfile = @"
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_API_URL=http://10.6.0.168:30033
ENV NEXT_PUBLIC_API_URL=`${NEXT_PUBLIC_API_URL}
ENV HOST=0.0.0.0
ENV PORT=3100

# Copy all files including node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3100
ENV HOST=0.0.0.0
ARG NEXT_PUBLIC_API_URL=http://10.6.0.168:30033
ENV NEXT_PUBLIC_API_URL=`${NEXT_PUBLIC_API_URL}

# Expose port
EXPOSE 3100

# Set container label for the image name
LABEL org.opencontainers.image.name="migrant-fe-portal"
LABEL org.opencontainers.image.version="v0.0.5"

# Start the application in production mode
CMD ["npm", "run", "start", "--", "-p", "3100", "-H", "0.0.0.0"]
"@

# Write the temporary Dockerfile
$offlineDockerfile | Out-File -FilePath ".\Dockerfile.offline" -Encoding utf8

# Build the Docker image with the offline Dockerfile
Write-Host "Building Docker image with offline Dockerfile..." -ForegroundColor Yellow
docker build `
  -f Dockerfile.offline `
  --build-arg NEXT_PUBLIC_API_URL=$API_URL `
  -t $FULL_IMAGE_NAME .

# Check if build was successful
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker build failed." -ForegroundColor Red
    exit 1
}

Write-Host "Docker image built successfully." -ForegroundColor Green

# Push the Docker image to the registry
Write-Host "Pushing Docker image to registry $REGISTRY..." -ForegroundColor Yellow
docker push $FULL_IMAGE_NAME

# Check if push was successful
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to push Docker image to registry." -ForegroundColor Red
    Write-Host "You may need to configure Docker to use insecure registries." -ForegroundColor Yellow
    Write-Host "Run the configure-docker-registry.ps1 script to add the registry to insecure registries." -ForegroundColor Yellow
    exit 1
}

# Clean up the temporary Dockerfile
Remove-Item -Path ".\Dockerfile.offline" -Force

Write-Host "Docker image pushed successfully to $FULL_IMAGE_NAME" -ForegroundColor Green
Write-Host "Image details:" -ForegroundColor Cyan
Write-Host "  - Registry: $REGISTRY" -ForegroundColor Cyan
Write-Host "  - Image name: $IMAGE_NAME" -ForegroundColor Cyan
Write-Host "  - Tag: $IMAGE_TAG" -ForegroundColor Cyan
Write-Host "  - Container port: 3100" -ForegroundColor Cyan
Write-Host "  - API Endpoint: $API_URL" -ForegroundColor Cyan
