# Docker build script with network fixes for migrant-fe-portal
# This script builds the Docker image with network options to help with connectivity issues

# Variables
$REGISTRY="10.6.0.157:30000"
$IMAGE_NAME="migrant-fe-portal"
$IMAGE_TAG="v0.0.5"
$FULL_IMAGE_NAME="$REGISTRY/$IMAGE_NAME`:$IMAGE_TAG"
$API_URL="http://10.6.0.168:30033"

# Display information
Write-Host "Building Docker image with network fixes: $FULL_IMAGE_NAME" -ForegroundColor Green
Write-Host "API URL: $API_URL" -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "Error: Docker is not running. Please start Docker and try again." -ForegroundColor Red
    exit 1
}

# Build the Docker image with network options
Write-Host "Building Docker image with network options..." -ForegroundColor Yellow
docker build `
  --network=host `
  --add-host=registry.npmjs.org:104.16.20.35 `
  --add-host=registry.npmmirror.com:104.193.66.39 `
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

Write-Host "Docker image pushed successfully to $FULL_IMAGE_NAME" -ForegroundColor Green
Write-Host "Image details:" -ForegroundColor Cyan
Write-Host "  - Registry: $REGISTRY" -ForegroundColor Cyan
Write-Host "  - Image name: $IMAGE_NAME" -ForegroundColor Cyan
Write-Host "  - Tag: $IMAGE_TAG" -ForegroundColor Cyan
Write-Host "  - Container port: 3100" -ForegroundColor Cyan
Write-Host "  - API Endpoint: $API_URL" -ForegroundColor Cyan
