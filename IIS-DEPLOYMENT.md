# eMPS Portal - IIS Deployment Guide

This document provides instructions for deploying the eMPS Portal application on Internet Information Services (IIS) on Windows.

## Prerequisites

Before deploying the application, ensure you have the following installed:

1. **Internet Information Services (IIS)** - Windows feature
2. **URL Rewrite Module** - [Download from Microsoft](https://www.iis.net/downloads/microsoft/url-rewrite)
3. **IISNode** - [Download from GitHub](https://github.com/Azure/iisnode/releases)
4. **Node.js** - [Download LTS version](https://nodejs.org/)

## Deployment Options

### Option 1: Automated Deployment (Recommended)

1. Open PowerShell as Administrator
2. Navigate to the project directory
3. Run the deployment script:
   ```powershell
   .\deploy-to-iis.ps1
   ```
4. Follow any prompts or instructions provided by the script

### Option 2: Manual Deployment

1. **Install Required Components**
   - Ensure IIS is installed with the Web Server role
   - Install URL Rewrite Module
   - Install IISNode

2. **Prepare Your Application**
   - Build the application:
     ```
     npm run build
     ```

3. **Create IIS Website**
   - Open IIS Manager
   - Create a new Application Pool:
     - Name: eMPS-Portal-Pool
     - .NET CLR Version: No Managed Code
     - Managed Pipeline Mode: Integrated
   - Create a new Website:
     - Site name: eMPS-Portal
     - Physical path: C:\inetpub\wwwroot\eMPS-Portal (or your preferred location)
     - Application pool: eMPS-Portal-Pool
     - Binding: Choose appropriate hostname and port

4. **Deploy Files**
   - Copy all application files to the website's physical path
   - Ensure web.config and iisnode.yml are in the root directory

5. **Configure Permissions**
   - Grant IIS_IUSRS and the application pool identity read/execute permissions to the website directory

## Verification

1. Open a web browser and navigate to your website URL
2. Verify that the application loads correctly
3. Test core functionality to ensure everything works as expected

## Troubleshooting

If you encounter issues:

1. **Check IISNode Logs**
   - Look in the `iisnode` directory within your website's physical path

2. **Verify URL Rewrite Module**
   - Make sure the module is properly installed and registered in IIS

3. **Check Node.js Process**
   - Use Task Manager to verify that node.exe processes are running

4. **Common Issues**
   - 502.5 Error: Often indicates a problem with the Node.js process
   - 404 Errors: May indicate routing issues with URL Rewrite
   - Permission issues: Check that IIS has appropriate access to the application files

## Additional Configuration

### Environment Variables

To set environment variables for your application:

1. Open IIS Manager
2. Select your application pool
3. Click "Advanced Settings"
4. Under "Process Model", find "Environment Variables" and add your variables

### HTTPS Configuration

To enable HTTPS:

1. Obtain an SSL certificate
2. In IIS Manager, select your website
3. Click "Bindings" in the Actions panel
4. Add a new binding with type HTTPS and select your certificate

## Support

For additional help, refer to:
- [IISNode Documentation](https://github.com/Azure/iisnode/wiki)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
