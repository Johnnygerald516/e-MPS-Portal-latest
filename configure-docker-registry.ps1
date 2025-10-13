# Configure Docker to use insecure registry
# This script adds the registry to the insecure-registries list in daemon.json

# Variables
$REGISTRY="10.6.0.157:30000"
$DAEMON_CONFIG_PATH="$env:ProgramData\docker\config\daemon.json"

# Display information
Write-Host "Configuring Docker to use insecure registry: $REGISTRY" -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "Error: Docker is not running. Please start Docker and try again." -ForegroundColor Red
    exit 1
}

# Check if daemon.json exists and update it
$daemonConfig = @{}

if (Test-Path $DAEMON_CONFIG_PATH) {
    $daemonConfig = Get-Content $DAEMON_CONFIG_PATH | ConvertFrom-Json
    Write-Host "Found existing daemon.json file." -ForegroundColor Yellow
} else {
    # Create directory if it doesn't exist
    $configDir = Split-Path -Parent $DAEMON_CONFIG_PATH
    if (-not (Test-Path $configDir)) {
        Write-Host "Creating Docker config directory..." -ForegroundColor Yellow
        New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    }
    Write-Host "Creating new daemon.json file." -ForegroundColor Yellow
}

# Add insecure registry if not already present
if (-not $daemonConfig.PSObject.Properties.Name.Contains("insecure-registries")) {
    $daemonConfig | Add-Member -Type NoteProperty -Name "insecure-registries" -Value @()
}

if ($daemonConfig."insecure-registries" -notcontains $REGISTRY) {
    $daemonConfig."insecure-registries" += $REGISTRY
    $daemonConfig | ConvertTo-Json -Depth 10 | Set-Content $DAEMON_CONFIG_PATH
    
    Write-Host "Added $REGISTRY to insecure registries." -ForegroundColor Green
    Write-Host "You need to restart Docker for the changes to take effect." -ForegroundColor Yellow
    Write-Host "After restarting Docker, run docker-build-push-simple.ps1 to build and push the image." -ForegroundColor Yellow
} else {
    Write-Host "$REGISTRY is already in the insecure registries list." -ForegroundColor Green
    Write-Host "You can run docker-build-push-simple.ps1 to build and push the image." -ForegroundColor Yellow
}

Write-Host "Configuration complete." -ForegroundColor Green
