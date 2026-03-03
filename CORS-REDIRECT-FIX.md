# CORS Redirect Fix - Protocol Downgrade Prevention

## Problem

**Error Message:**
```
Access to fetch at 'http://migrantonline.immigration.go.tz/applications/' 
(redirected from 'https://migrantonline.immigration.go.tz/api/applications') 
from origin 'http://localhost:3001' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
Redirect is not allowed for a preflight request.
```

## Root Cause

The external API server is performing a redirect that:
1. **Changes the protocol** from `https://` to `http://` (protocol downgrade)
2. **Changes the path** from `/api/applications` to `/applications/`

This causes a CORS error because:
- Browsers do not allow redirects during CORS preflight requests (OPTIONS)
- Even if allowed, the protocol downgrade from HTTPS to HTTP is a security violation

## Redirect Chain

```
Client Request:
  → https://migrantonline.immigration.go.tz/api/applications

Server Redirect (301/302):
  → http://migrantonline.immigration.go.tz/applications/
     ^^^^                                    ^^^^^^^^^^^
     Protocol downgrade                      Path changed

Browser: ❌ BLOCKED by CORS policy
```

## Solution Implemented

### 1. Manual Redirect Handling

Instead of letting the browser follow redirects automatically (which fails for CORS preflight), we:
1. Set `redirect: 'manual'` in fetch options
2. Detect redirect responses (status 300-399)
3. Extract the redirect URL from the `Location` header
4. **Force HTTPS protocol** on the redirect URL
5. Make a new request to the secure URL

### 2. Code Changes

#### Updated `/src/app/api/applications/route.ts`

```typescript
import { ensureHttps } from "@/lib/config/api-config";

// Use ensureHttps for the base URL
const apiUrl = ensureHttps(process.env.NEXT_PUBLIC_API_URL || 'https://migrantonline.immigration.go.tz/api');

// Configure fetch with manual redirect handling
let response = await fetch(externalApiUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify(apiPayload),
  redirect: 'manual' // KEY: Handle redirects manually
});

// Handle redirects manually to ensure HTTPS protocol
if (response.status >= 300 && response.status < 400) {
  const redirectUrl = response.headers.get('location');
  if (redirectUrl) {
    console.log('Redirect detected:', redirectUrl);
    const secureRedirectUrl = ensureHttps(redirectUrl); // Force HTTPS
    console.log('Following redirect with HTTPS:', secureRedirectUrl);
    
    response = await fetch(secureRedirectUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(apiPayload),
    });
  }
}
```

#### Updated `/src/app/api/applications/lookup/route.ts`

Applied the same manual redirect handling pattern with timeout support:

```typescript
import { ensureHttps } from "@/lib/config/api-config";

const apiUrl = ensureHttps(process.env.NEXT_PUBLIC_API_URL || 'https://migrantonline.immigration.go.tz/api');

let response = await fetch(externalApiUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify(requestData),
  signal: controller.signal,
  redirect: 'manual'
});

// Manual redirect handling with HTTPS enforcement
if (response.status >= 300 && response.status < 400) {
  const redirectUrl = response.headers.get('location');
  if (redirectUrl) {
    const secureRedirectUrl = ensureHttps(redirectUrl);
    // Follow redirect with new request
    response = await fetch(secureRedirectUrl, { /* ... */ });
  }
}
```

## How It Works

### Before (Automatic Redirects - FAILS)
```
1. Browser sends OPTIONS preflight → https://...api/applications
2. Server responds: 301 Redirect → http://...applications/
3. Browser: ❌ BLOCKED - Cannot redirect during preflight
```

### After (Manual Redirects - WORKS)
```
1. Next.js API sends POST → https://...api/applications
2. Server responds: 301 Redirect → http://...applications/
3. Next.js detects redirect (status 301)
4. Next.js converts to HTTPS → https://...applications/
5. Next.js sends new POST → https://...applications/
6. Server responds: 200 OK
7. Next.js returns response to browser (no CORS issues)
```

## Benefits

1. **Bypasses CORS Preflight Restrictions**: The Next.js API route acts as a proxy, so the browser never sees the redirect
2. **Enforces HTTPS**: All redirects are automatically converted to HTTPS, preventing protocol downgrades
3. **Transparent to Frontend**: The frontend code doesn't need to change
4. **Maintains Security**: No HTTP connections are made, even if the server tries to redirect to HTTP

## Testing

After implementing this fix:

1. **Restart the development server**:
   ```bash
   npm run dev
   ```

2. **Test the verification endpoint**:
   - Go to the application form
   - Fill in the verification details
   - Submit the form
   - Check browser console for redirect logs

3. **Check server logs** for:
   ```
   Redirect detected: http://migrantonline.immigration.go.tz/applications/
   Following redirect with HTTPS: https://migrantonline.immigration.go.tz/applications/
   ```

4. **Verify in Network tab**:
   - Request to `/api/applications` should succeed
   - No CORS errors should appear
   - Response should contain valid data

## Alternative Solutions (Not Used)

### Option 1: Fix Backend Server
- Configure the backend to not redirect HTTPS to HTTP
- **Pros**: Cleanest solution
- **Cons**: Requires backend access and changes

### Option 2: Use HTTP for Everything
- Change all URLs to use HTTP
- **Pros**: Simple
- **Cons**: Major security vulnerability, not acceptable for production

### Option 3: Disable CORS (Backend)
- Configure backend to allow all origins
- **Pros**: Simple backend change
- **Cons**: Doesn't solve the redirect issue, security concerns

## Related Files

- `src/lib/config/api-config.ts` - Contains `ensureHttps()` function
- `src/app/api/applications/route.ts` - Verification endpoint with redirect handling
- `src/app/api/applications/lookup/route.ts` - Lookup endpoint with redirect handling
- `HTTPS-PROTOCOL-FIX.md` - Related documentation on HTTPS enforcement

## Notes

- This solution works because Next.js API routes run on the server-side, not in the browser
- Server-side fetch is not subject to CORS restrictions
- The manual redirect handling prevents protocol downgrades
- All external API calls should use this pattern going forward
