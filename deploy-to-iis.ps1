# PowerShell script to deploy Next.js application to IIS
# Run this script as Administrator

# Configuration variables
$siteName = "eMPS-Portal"
$appPoolName = "eMPS-Portal-Pool"
$physicalPath = "C:\inetpub\wwwroot\eMPS-Portal"
$port = 80
$hostName = "emps-portal.local" # Change this to your desired hostname

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Warning "You need to run this script as an Administrator!"
    Exit 1
}

# Ensure IIS is installed
Write-Host "Checking IIS installation..."
$iisInstalled = Get-WindowsFeature -Name Web-Server
if (-not $iisInstalled.Installed) {
    Write-Host "IIS is not installed. Installing IIS..."
    Install-WindowsFeature -Name Web-Server -IncludeManagementTools
}

# Check and install URL Rewrite Module
Write-Host "Checking URL Rewrite Module..."
$rewriteModule = Get-WebGlobalModule -Name "RewriteModule" -ErrorAction SilentlyContinue
if ($null -eq $rewriteModule) {
    Write-Host "URL Rewrite Module is not installed. Please install it from: https://www.iis.net/downloads/microsoft/url-rewrite"
    Write-Host "After installation, run this script again."
    Exit 1
}

# Check and install IIS Node
Write-Host "Checking IISNode installation..."
$iisNodePath = "C:\Program Files\iisnode\iisnode.dll"
if (-not (Test-Path $iisNodePath)) {
    Write-Host "IISNode is not installed. Please install it from: https://github.com/Azure/iisnode/releases"
    Write-Host "After installation, run this script again."
    Exit 1
}

# Create directory if it doesn't exist
if (-not (Test-Path $physicalPath)) {
    Write-Host "Creating directory: $physicalPath"
    New-Item -ItemType Directory -Path $physicalPath -Force
}

# Copy application files
Write-Host "Copying application files to $physicalPath..."
$sourceDir = "C:\eMPS-Portal2"
$excludeItems = @(".git", "node_modules", ".vscode", ".next-dev", ".idea")

Get-ChildItem -Path $sourceDir -Exclude $excludeItems | Copy-Item -Destination $physicalPath -Recurse -Force

# Create application pool if it doesn't exist
if (-not (Get-IISAppPool -Name $appPoolName -ErrorAction SilentlyContinue)) {
    Write-Host "Creating application pool: $appPoolName"
    New-WebAppPool -Name $appPoolName
    Set-ItemProperty -Path "IIS:\AppPools\$appPoolName" -Name "managedRuntimeVersion" -Value ""
    Set-ItemProperty -Path "IIS:\AppPools\$appPoolName" -Name "processModel.identityType" -Value "ApplicationPoolIdentity"
}

# Create website if it doesn't exist
if (-not (Get-Website -Name $siteName -ErrorAction SilentlyContinue)) {
    Write-Host "Creating website: $siteName"
    New-Website -Name $siteName -PhysicalPath $physicalPath -ApplicationPool $appPoolName -Port $port -HostHeader $hostName
} else {
    Write-Host "Website $siteName already exists. Updating configuration..."
    Set-ItemProperty -Path "IIS:\Sites\$siteName" -Name "physicalPath" -Value $physicalPath
    Set-ItemProperty -Path "IIS:\Sites\$siteName" -Name "applicationPool" -Value $appPoolName
}

# Update hosts file
$hostsPath = "$env:windir\System32\drivers\etc\hosts"
$hostsContent = Get-Content -Path $hostsPath
if (-not ($hostsContent -match $hostName)) {
    Write-Host "Adding $hostName to hosts file..."
    Add-Content -Path $hostsPath -Value "`n127.0.0.1`t$hostName" -Force
}

# Install node modules if needed
if (-not (Test-Path "$physicalPath\node_modules")) {
    Write-Host "Installing node modules..."
    Set-Location -Path $physicalPath
    & npm install --production
}

Write-Host "Deployment completed successfully!"
Write-Host "You can access your application at: http://$hostName"
Write-Host ""
Write-Host "IMPORTANT: Make sure you have installed:"
Write-Host "1. URL Rewrite Module: https://www.iis.net/downloads/microsoft/url-rewrite"
Write-Host "2. IISNode: https://github.com/Azure/iisnode/releases"
Write-Host ""
Write-Host "If you encounter any issues, check the iisnode logs in $physicalPath\iisnode"
