# API URL Configuration Fix

This document explains how to fix the issue with the application not using the API URL from the `.env` file.

## The Issue

The application was making API requests to `http://localhost:3001/api/applications/lookup` instead of using the API URL specified in the `.env` file (`http://10.6.0.164:30033`).

## The Fix

We've made several changes to ensure the application correctly uses the API URL from the environment variables:

1. Updated `next.config.js` to use environment variables for API URL in headers and rewrites
2. Fixed the API route in `src/app/api/applications/lookup/route.ts` to properly handle the environment variable
3. Updated the `fetchApplicationTypes` function in `src/lib/api/endpoints/verification.ts` to use the axios instance
4. Added error handling for invalid URL formats
5. Created utility scripts for checking environment variables and clean restart

## How to Use the Fix

### 1. Check Environment Variables

Run the following command to check if your environment variables are properly configured:

```
npm run check-env
```

This will show you:
- The current value of `NEXT_PUBLIC_API_URL`
- Whether it's a valid URL format
- If the API server is accessible

### 2. Clean Restart the Application

If you're still having issues, try a clean restart:

```
npm run clean-restart
```

This script will:
1. Clear the Next.js cache directory
2. Reload environment variables
3. Validate the API URL format
4. Restart the development server

### 3. Manual Fix

If you're still experiencing issues, make sure:

1. Your `.env` file contains the correct API URL:
   ```
   NEXT_PUBLIC_API_URL=http://10.6.0.164:30033
   ```

2. The API server is running and accessible
3. There are no network issues preventing access to the API server

## Technical Details

### Client-Side API Calls

We've updated the client-side API calls to use the axios instance that's configured with the environment variable:

```typescript
// Import axios instance to ensure we use the configured API URL
const api = (await import('../axios')).default;

// Use the axios instance that's already configured with the API URL
const response = await api.post('/applications/lookup', payload);
```

### Server-Side API Routes

We've improved the server-side API routes to properly handle the environment variable:

```typescript
// Check if API URL is configured
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
if (!apiUrl) {
  console.error('NEXT_PUBLIC_API_URL is not configured');
  return NextResponse.json(
    { 
      ackCode: 0, 
      ackMessage: "API URL not configured. Please set NEXT_PUBLIC_API_URL environment variable.",
      jsonResult: []
    },
    { status: 500 }
  );
}

console.log('Using API URL from environment:', apiUrl);

// Call the external API
const externalApiUrl = `${apiUrl}/applications/lookup`;
```

### URL Validation

We've added URL validation to prevent errors with invalid URL formats:

```typescript
try {
  currentUrl = new URL(externalApiUrl);
} catch (error) {
  console.error('Invalid URL format:', externalApiUrl, error);
  return NextResponse.json(
    { 
      ackCode: 0, 
      ackMessage: `Invalid API URL format: ${externalApiUrl}`,
      jsonResult: []
    },
    { status: 500 }
  );
}
```

## Troubleshooting

If you're still having issues:

1. Check the browser console for error messages
2. Look at the server logs for API connection errors
3. Try accessing the API directly to ensure it's available
4. Verify that your `.env` file is being loaded correctly
5. Clear your browser cache and restart the application

For further assistance, contact the development team.
