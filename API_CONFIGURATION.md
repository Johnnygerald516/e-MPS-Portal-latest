# API Configuration Guide

## Overview
This application has been updated to use real APIs instead of mock data. All API endpoints now require proper configuration to function correctly.

## Environment Variables

### Required Environment Variable
You must set the following environment variable for the application to work:

```
NEXT_PUBLIC_API_URL=https://your-actual-api-domain.com/api
```

### Setting Up Environment Variables

#### For Development
1. Create a `.env.local` file in the root directory of your project
2. Add the following line:
   ```
   NEXT_PUBLIC_API_URL=https://your-actual-api-domain.com/api
   ```

#### For Production
Set the environment variable in your deployment platform:
- **Vercel**: Add it in the Environment Variables section of your project settings
- **Netlify**: Add it in the Environment variables section of your site settings
- **Docker**: Use the `-e` flag or environment section in docker-compose.yml

## API Endpoints

The application now connects to the following real API endpoints:

### 1. Lookup API
- **Endpoint**: `{API_URL}/lookup`
- **Method**: POST
- **Purpose**: Fetches lookup data (countries, regions, districts, etc.)

### 2. Application Verification API
- **Endpoint**: `{API_URL}/applications/verify`
- **Method**: POST
- **Purpose**: Verifies application data

### 3. Application Details API
- **Endpoint**: `{API_URL}/applications/{applicationId}`
- **Method**: GET
- **Purpose**: Retrieves detailed application information

### 4. Application Attachments API
- **Endpoint**: `{API_URL}/applications/{applicationId}/attachments/{nextStageId}`
- **Method**: POST
- **Purpose**: Handles application stage progression

## Error Handling

The application now properly handles API errors and will return appropriate error messages when:
- API URL is not configured
- API is unreachable
- API returns error responses
- API returns non-JSON responses

## Migration from Mock Data

All mock data has been removed from the following files:
- `src/app/api/applications/lookup/route.ts`
- `src/app/api/applications/route.ts`
- `src/app/api/applications/[applicationId]/route.ts`
- `src/app/api/applications/[applicationId]/attachments/[nextStageId]/route.ts`

## Testing

To test the API connections:
1. Set the `NEXT_PUBLIC_API_URL` environment variable
2. Start the development server: `npm run dev`
3. Test each endpoint through the application interface
4. Check the browser console and server logs for any connection issues

## Troubleshooting

### Common Issues:
1. **"API URL not configured"** - Set the `NEXT_PUBLIC_API_URL` environment variable
2. **"Failed to connect to external API"** - Check if the API URL is correct and accessible
3. **503 Service Unavailable** - The external API is down or unreachable
4. **502 Bad Gateway** - The API returned a non-JSON response

### Debugging:
- Check the browser console for client-side errors
- Check the server logs for API connection issues
- Verify the API URL is accessible from your server environment
