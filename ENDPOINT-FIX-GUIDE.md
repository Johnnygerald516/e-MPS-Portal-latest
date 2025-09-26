# Complete Guide to Fix All Endpoints to Use Environment Variables

## Problem Summary
Your application was not properly using the `NEXT_PUBLIC_API_URL` from the `.env` file. Instead, it was making API calls to hardcoded URLs or using relative paths that weren't being handled correctly.

## Solution Overview
We've created a comprehensive fix that:
1. Updates all endpoint files to use axios instead of fetch
2. Ensures all API calls use the environment variable
3. Provides proper error handling
4. Creates backup files before making changes

## How to Apply the Fix

### Option 1: Run the Batch Script (Recommended for Windows)
```bash
# Double-click or run from command prompt
fix-endpoints.bat
```

### Option 2: Run via npm
```bash
npm run fix-endpoints
```

### Option 3: Run the Node.js script directly
```bash
node scripts/complete-endpoint-fix.js
```

## What the Fix Does

### 1. Updates Endpoint Files
The script will fix these files:
- `src/lib/api/endpoints/verification.ts`
- `src/lib/api/endpoints/documents.ts`
- `src/lib/api/endpoints/personal-info.ts`
- `src/lib/api/endpoints/parents-info.ts`
- `src/lib/api/endpoints/residence-info.ts`
- `src/lib/api/endpoints/dependant-info.ts`

### 2. Replaces Fetch Calls with Axios
**Before:**
```typescript
const response = await fetch('/api/applications/lookup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
});

if (!response.ok) {
  const errorText = await response.text();
  // error handling
}

const responseData = await response.json();
```

**After:**
```typescript
// Import axios instance to ensure we use the configured API URL
const api = (await import('../axios')).default;

const response = await api.post('/applications/lookup', payload);
const responseData = response.data;
```

### 3. Environment Variable Configuration
Ensures your `.env` file is correctly set:
```env
NEXT_PUBLIC_API_URL=http://10.6.0.164:30033
```

## After Running the Fix

### 1. Restart Your Development Server
```bash
# Stop the current server (Ctrl+C)
# Then restart with:
npm run dev
# or
npm run clean-restart
```

### 2. Test Your Application
- Navigate to pages that use API calls
- Check the browser console for any errors
- Verify that API calls are going to the correct URL

### 3. Check the Logs
The axios configuration will log the API URL being used:
```
===== API Configuration =====
API URL from env: http://10.6.0.164:30033
API URL being used: http://10.6.0.164:30033
```

## Backup Files
The script creates backup files with `.backup` extension:
- `verification.ts.backup`
- `documents.ts.backup`
- etc.

If something goes wrong, you can restore from these backups.

## Troubleshooting

### If the fix doesn't work:
1. **Check your .env file**:
   ```bash
   npm run verify-env
   ```

2. **Clear Next.js cache**:
   ```bash
   npm run clean-restart
   ```

3. **Check browser console** for error messages

4. **Verify API server is running** at `http://10.6.0.164:30033`

### Common Issues:
- **"Invalid URL" errors**: Usually means the environment variable isn't loaded
- **CORS errors**: Check that your API server allows requests from your Next.js app
- **Network errors**: Verify the API server is accessible

## Manual Verification

After running the fix, you can manually verify by:

1. **Check that axios is being used**:
   Open any endpoint file and look for:
   ```typescript
   const api = (await import('../axios')).default;
   const response = await api.post('/applications/lookup', payload);
   ```

2. **Check browser Network tab**:
   - API calls should go directly to `http://10.6.0.164:30033`
   - Not to `http://localhost:3001/api/...`

3. **Check console logs**:
   - Should see "API URL being used: http://10.6.0.164:30033"
   - No "Invalid URL" errors

## Additional Scripts Available

- `npm run verify-env` - Check environment variables
- `npm run check-env` - Comprehensive environment check
- `npm run clean-restart` - Clear cache and restart
- `npm run fix-endpoints` - Run the endpoint fix

## Support

If you encounter any issues after running the fix:
1. Check the console output for specific error messages
2. Verify your `.env` file configuration
3. Ensure the API server is running and accessible
4. Check the backup files if you need to revert changes

The fix is designed to be comprehensive and should resolve all issues with endpoints not using the environment variables correctly.
