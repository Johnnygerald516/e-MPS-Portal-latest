# Docker build and push script for migrant-fe-portal
# This script builds and pushes the Docker image to the specified registry

# Variables
$REGISTRY="10.6.0.157:30000"
$IMAGE_NAME="migrant-fe-portal"
$IMAGE_TAG="v0.0.3"
$FULL_IMAGE_NAME="$REGISTRY/$IMAGE_NAME`:$IMAGE_TAG"

# Display information
Write-Host "Building and pushing Docker image: $FULL_IMAGE_NAME" -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "Error: Docker is not running. Please start Docker and try again." -ForegroundColor Red
    exit 1
}

# Build the Docker image
Write-Host "Building Docker image..." -ForegroundColor Yellow
docker build -t $FULL_IMAGE_NAME .

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
    exit 1
}

Write-Host "Docker image pushed successfully to $FULL_IMAGE_NAME" -ForegroundColor Green
Write-Host "Image details:" -ForegroundColor Cyan
Write-Host "  - Registry: $REGISTRY" -ForegroundColor Cyan
Write-Host "  - Image name: $IMAGE_NAME" -ForegroundColor Cyan
Write-Host "  - Tag: $IMAGE_TAG" -ForegroundColor Cyan
Write-Host "  - Container port: 3100" -ForegroundColor Cyan
Write-Host "  - API Endpoint: 10.6.0.164:30033" -ForegroundColor Cyan
