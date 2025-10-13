# Deploy to Kubernetes
# This script deploys the application to Kubernetes using the k8s-deployment.yaml file

# Variables
$DEPLOYMENT_FILE="k8s-deployment.yaml"
$REGISTRY="10.6.0.157:30000"
$IMAGE_NAME="migrant-fe-portal"
$IMAGE_TAG="v0.0.5"
$API_URL="http://10.6.0.168:30033"

# Display information
Write-Host "Deploying to Kubernetes using $DEPLOYMENT_FILE" -ForegroundColor Green
Write-Host "Image: $REGISTRY/$IMAGE_NAME`:$IMAGE_TAG" -ForegroundColor Cyan
Write-Host "API URL: $API_URL" -ForegroundColor Cyan

# Check if kubectl is installed
try {
    kubectl version --client | Out-Null
} catch {
    Write-Host "Error: kubectl is not installed or not in PATH. Please install kubectl and try again." -ForegroundColor Red
    exit 1
}

# Apply the deployment
Write-Host "Applying Kubernetes deployment..." -ForegroundColor Yellow
kubectl apply -f $DEPLOYMENT_FILE

# Check if deployment was successful
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to apply Kubernetes deployment." -ForegroundColor Red
    exit 1
}

Write-Host "Kubernetes deployment applied successfully." -ForegroundColor Green

# Get deployment status
Write-Host "Checking deployment status..." -ForegroundColor Yellow
kubectl get deployments -l app=migrant-fe-portal

# Get pod status
Write-Host "Checking pod status..." -ForegroundColor Yellow
kubectl get pods -l app=migrant-fe-portal

# Get service status
Write-Host "Checking service status..." -ForegroundColor Yellow
kubectl get services migrant-fe-portal-service

# Get ingress status
Write-Host "Checking ingress status..." -ForegroundColor Yellow
kubectl get ingress migrant-fe-portal-ingress

Write-Host "Deployment complete." -ForegroundColor Green
Write-Host "The application should be accessible through the Ingress or ClusterIP." -ForegroundColor Cyan
