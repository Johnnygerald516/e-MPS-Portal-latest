# Docker build and push script for migrant-fe-portal
# This script builds and pushes the Docker image to the specified registry

# Variables
$REGISTRY="41.59.104.107:30000"
$IMAGE_NAME="migrant-fe-portal"
$IMAGE_TAG="v0.0.1"
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
docker build --build-arg NEXT_PUBLIC_API_URL=http://41.59.104.109:30033 -t $FULL_IMAGE_NAME .

# Check if build was successful
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker build failed." -ForegroundColor Red
    exit 1
}

Write-Host "Docker image built successfully." -ForegroundColor Green

# Configure Docker to use insecure registry if needed
Write-Host "Configuring Docker to use insecure registry..." -ForegroundColor Yellow

# Check if daemon.json exists and update it
$daemonConfigPath = "$env:ProgramData\docker\config\daemon.json"
$daemonConfig = @{}

if (Test-Path $daemonConfigPath) {
    $daemonConfig = Get-Content $daemonConfigPath | ConvertFrom-Json
} else {
    # Create directory if it doesn't exist
    $configDir = Split-Path -Parent $daemonConfigPath
    if (-not (Test-Path $configDir)) {
        New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    }
}

# Add insecure registry if not already present
if (-not $daemonConfig.PSObject.Properties.Name.Contains("insecure-registries")) {
    $daemonConfig | Add-Member -Type NoteProperty -Name "insecure-registries" -Value @()
}

if ($daemonConfig."insecure-registries" -notcontains $REGISTRY) {
    $daemonConfig."insecure-registries" += $REGISTRY
    $daemonConfig | ConvertTo-Json -Depth 10 | Set-Content $daemonConfigPath
    
    Write-Host "Added $REGISTRY to insecure registries. Docker may need to be restarted." -ForegroundColor Yellow
    Write-Host "Please restart Docker if the push fails, then run this script again." -ForegroundColor Yellow
}

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
Write-Host "  - API Endpoint: 41.59.104.109:30033" -ForegroundColor Cyan
