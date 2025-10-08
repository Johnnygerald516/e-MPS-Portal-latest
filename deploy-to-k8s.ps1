# Kubernetes deployment script for migrant-fe-portal
# This script builds, pushes the Docker image, and deploys to Kubernetes

# Variables
$REGISTRY="10.6.0.157:30000"
$IMAGE_NAME="migrant-fe-portal"
$IMAGE_TAG="v0.0.4"
$FULL_IMAGE_NAME="$REGISTRY/$IMAGE_NAME`:$IMAGE_TAG"
$API_ENDPOINT="http://10.6.0.168:30033"
$CONTAINER_PORT=3100

# Display information
Write-Host "Deploying migrant-fe-portal to Kubernetes" -ForegroundColor Green
Write-Host "Image: $FULL_IMAGE_NAME" -ForegroundColor Green
Write-Host "API Endpoint: $API_ENDPOINT" -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "Error: Docker is not running. Please start Docker and try again." -ForegroundColor Red
    exit 1
}

# Build the Docker image
Write-Host "Building Docker image..." -ForegroundColor Yellow
docker build --build-arg NEXT_PUBLIC_API_URL=$API_ENDPOINT -t $FULL_IMAGE_NAME .

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

# Check if kubectl is available
try {
    kubectl version --client | Out-Null
} catch {
    Write-Host "Error: kubectl is not available. Please install kubectl and try again." -ForegroundColor Red
    exit 1
}

# Apply Kubernetes manifests
Write-Host "Deploying to Kubernetes..." -ForegroundColor Yellow
kubectl apply -f kubernetes/deployment.yaml
kubectl apply -f kubernetes/service.yaml

# Check if deployment was successful
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to deploy to Kubernetes." -ForegroundColor Red
    exit 1
}

Write-Host "Deployment successful!" -ForegroundColor Green
Write-Host "Checking deployment status..." -ForegroundColor Yellow

# Wait for deployment to be ready
Start-Sleep -Seconds 5
kubectl get deployments | Select-String "migrant-fe-portal"
kubectl get services | Select-String "migrant-fe-portal"

Write-Host "Deployment complete. Your application should be accessible soon." -ForegroundColor Green
Write-Host "Access your application at: http://10.6.0.157:30000" -ForegroundColor Cyan
