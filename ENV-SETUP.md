# Environment Configuration Guide

This guide explains how to properly configure environment variables for the eMPS Portal application.

## Environment Variables

The application uses environment variables to configure various settings, including the API URL. The main environment variables are:

- `NEXT_PUBLIC_API_URL`: The URL of the API server (e.g., `http://10.6.0.164:30033`)
- `HOST`: The host to bind the server to (default: `0.0.0.0`)
- `PORT`: The port to run the server on (default: `3001`)

## Configuration Files

The application uses the following configuration files:

1. `.env`: Main environment configuration file for development
2. `.env.production`: Environment configuration for production mode
3. `.env.local`: Local overrides (not committed to version control)

## Setting Up Environment Variables

### Option 1: Using .env File (Recommended)

1. Make sure your `.env` file exists in the root directory of the project
2. Ensure it contains the correct API URL:
   ```
   NEXT_PUBLIC_API_URL=http://10.6.0.164:30033
   ```
3. Start the application using one of the following commands:
   ```
   npm run dev
   ```
   or
   ```
   npm run dev-safe
   ```

### Option 2: Setting Environment Variables Directly

You can also set environment variables directly when starting the application:

```
set NEXT_PUBLIC_API_URL=http://10.6.0.164:30033 && npm run dev
```

## Verifying Configuration

To verify that your environment variables are properly configured, run:

```
node scripts/test-env-config.js
```

This will display all configured environment variables and check if the API URL is properly set.

## Troubleshooting

If the application is not using the environment variables from your `.env` file:

1. Make sure the `.env` file exists in the root directory of the project
2. Check that the file has the correct format (no spaces around the `=` sign)
3. Try restarting the application
4. Clear the `.next` cache directory:
   ```
   rmdir /s /q .next
   ```
5. Check the console logs for any error messages related to environment variables

## Production Deployment

For production deployment:

1. Create a `.env.production` file with the production settings
2. Build the application:
   ```
   npm run build:prod
   ```
3. Start the production server:
   ```
   npm run start:prod
   ```
