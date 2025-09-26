# External API Configuration Guide

This document provides instructions for configuring the eMPS Portal to work with the external API endpoint at http://10.6.0.164:30033.

## Configuration Files

### 1. Environment Files

The system uses the following environment files:

- `.env` - Used during development
- `.env.production` - Used in production mode

Both files should contain the following configuration:

```
# API Configuration
NEXT_PUBLIC_API_URL=http://10.6.0.164:30033
```

### 2. Next.js Configuration

The `next.config.js` file has been configured with:

- CORS headers to allow communication with the external API
- API proxy configuration to forward requests to the external API
- Image domain configuration to allow loading images from the external API

### 3. Axios Configuration

The axios client in `src/lib/api/axios.ts` has been configured to:

- Use the external API URL as the base URL
- Include proper headers for authentication
- Handle token refresh properly

## Testing the API Connection

You can test the connection to the external API using the provided script:

```bash
npm run check-api
```

This script will:
1. Attempt to connect to the API's health endpoint
2. Try alternative endpoints if the health check fails
3. Run network diagnostics if all connection attempts fail
4. Provide recommendations for troubleshooting

## Troubleshooting

If you encounter issues connecting to the external API:

1. **Network Connectivity**
   - Ensure your system can reach the API server at 10.6.0.164
   - Check if port 30033 is accessible
   - Verify firewall settings

2. **API Server Status**
   - Confirm the API server is running
   - Check if the API server requires authentication

3. **Environment Variables**
   - Verify the NEXT_PUBLIC_API_URL is correctly set in your environment files
   - Make sure the server.js file is not overriding your API URL

4. **CORS Issues**
   - If you see CORS errors in the browser console, check the CORS configuration in next.config.js
   - Ensure the API server allows requests from your application's domain

## Deployment Configuration

When deploying the application:

1. Ensure the `.env.production` file contains the correct API URL
2. Update the `ecosystem.config.js` file if you're using PM2 for deployment
3. Verify the server.js file is using the correct API URL

## API Endpoints

The application is configured to use the following API endpoints:

- Authentication: `http://10.6.0.164:30033/auth/*`
- Applications: `http://10.6.0.164:30033/applications/*`
- Lookup data: `http://10.6.0.164:30033/lookup/*`

## Security Considerations

- API keys and tokens are handled securely
- HTTPS is recommended for production deployments
- Authentication tokens are stored in localStorage and included in API requests
