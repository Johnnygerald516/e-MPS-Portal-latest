# Environment Configuration Guide

This document explains how environment variables are configured and used in the eMPS Portal application, particularly focusing on the API URL configuration.

## Environment Files

The application uses the following environment files in order of priority:

1. `.env.production` - Used in production environments
2. `.env` - Default fallback for all environments

## Key Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | The URL of the API server | `http://10.6.0.164:30033` |
| `NEXT_PUBLIC_API_KEY` | API key for authentication | `sk-proj-xxx` |
| `HOST` | Host to bind the server to | `0.0.0.0` |
| `PORT` | Port to run the server on | `3001` |

## PM2 Deployment

When deploying with PM2, the environment variables are loaded from `.env.production` (or `.env` if the production file doesn't exist). The configuration is in `ecosystem.config.js`.

### Important Notes for PM2 Deployment

1. Make sure your `.env.production` file exists and contains the correct `NEXT_PUBLIC_API_URL`
2. The server will exit if `NEXT_PUBLIC_API_URL` is not defined
3. PM2 will use the environment variables from the config files, not from the system environment

## Troubleshooting

If you're experiencing issues with the API URL:

1. Run the test script to verify environment loading:
   ```
   node scripts/test-env-loading.js
   ```

2. Check that your `.env.production` file exists and has the correct values:
   ```
   cat .env.production
   ```

3. Restart the PM2 process after making changes:
   ```
   pm2 restart eMPS-Portal
   ```

4. Check the PM2 logs for any errors:
   ```
   pm2 logs eMPS-Portal
   ```

## Common Issues

### Server using IP address instead of environment variable

This was fixed by:
1. Removing hardcoded API URL in `ecosystem.config.js`
2. Ensuring proper environment variable loading in `server.js`
3. Removing fallback to server IP in `axios.ts`

If you still experience this issue, make sure you've restarted the PM2 process after updating the configuration files.
