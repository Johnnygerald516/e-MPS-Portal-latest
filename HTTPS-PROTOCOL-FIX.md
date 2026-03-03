# HTTPS Protocol Enforcement Fix

## Problem
Request headers were showing `http://migrantonline.immigration.go.tz/applications/` instead of `https://migrantonline.immigration.go.tz/applications/`

## Root Cause
While the `.env` file correctly specified `https://`, some parts of the application were not enforcing the HTTPS protocol when constructing API URLs.

## Solution Implemented

### 1. Enhanced API Configuration (`src/lib/config/api-config.ts`)

Added three key functions to ensure HTTPS protocol:

```typescript
// Ensures any URL uses https:// protocol
export function ensureHttps(url: string): string

// Builds complete API URLs with guaranteed https://
export function buildApiUrl(path: string): string

// Updated apiConfig to use ensureHttps
export const apiConfig = {
  baseUrl: ensureHttps(getApiUrl()),
  // ...
}
```

### 2. Updated Next.js Configuration (`next.config.js`)

Added protocol enforcement in the rewrites function:

```javascript
async rewrites() {
  let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://migrantonline.immigration.go.tz/api';
  
  // Ensure the URL uses https:// protocol
  if (apiUrl.startsWith('http://')) {
    apiUrl = apiUrl.replace('http://', 'https://');
  }
  // ...
}
```

### 3. Updated All Service Files

Modified the following service files to use `ensureHttps()`:

- `src/services/bill-service.ts`
- `src/services/receipt-service.ts`
- `src/services/application-status.ts`
- `src/services/application-pass.ts`
- `src/services/application-bill.ts`
- `src/services/application-receipt.ts`

Example pattern:
```typescript
import { apiConfig, ensureHttps } from '@/lib/config/api-config';

// Before
const response = await fetch(`${apiConfig.baseUrl}/applications/${id}/endpoint`);

// After
const apiUrl = ensureHttps(apiConfig.baseUrl);
const response = await fetch(`${apiUrl}/applications/${id}/endpoint`);
```

### 4. Updated API Endpoint Files

Modified `src/lib/api/endpoints/verification.ts` to import and use `ensureHttps`:

```typescript
import { apiConfig, ensureHttps } from '@/lib/config/api-config';
```

## Files Modified

### Core Configuration Files
1. `src/lib/config/api-config.ts` - Added `ensureHttps()` and `buildApiUrl()` functions
2. `next.config.js` - Added protocol enforcement in rewrites
3. `src/lib/utils/api-route-helpers.ts` - Updated to use `ensureHttps()` with redirect handling
4. `src/lib/api/axios.ts` - Updated to use `ensureHttps()` for base URL
5. `src/lib/api/endpoints/location.ts` - Updated axios baseURL to use `ensureHttps()`

### Service Files
6. `src/services/bill-service.ts` - Added `ensureHttps()` usage
7. `src/services/receipt-service.ts` - Added `ensureHttps()` usage
8. `src/services/application-status.ts` - Added `ensureHttps()` usage
9. `src/services/application-pass.ts` - Added `ensureHttps()` usage
10. `src/services/application-bill.ts` - Added `ensureHttps()` usage
11. `src/services/application-receipt.ts` - Added `ensureHttps()` usage
12. `src/lib/api/endpoints/verification.ts` - Added `ensureHttps()` import

### API Route Files (All updated with ensureHttps and redirect handling)
13. `src/app/api/applications/route.ts` - Main applications route
14. `src/app/api/applications/lookup/route.ts` - Lookup route
15. `src/app/api/applications/status/route.ts` - Status route
16. `src/app/api/applications/[applicationId]/route.ts` - Application by ID
17. `src/app/api/applications/[applicationId]/personal-info/route.ts` - Personal info
18. `src/app/api/applications/[applicationId]/residence-info/route.ts` - Residence info
19. `src/app/api/applications/[applicationId]/dependants/route.ts` - Dependants
20. `src/app/api/applications/[applicationId]/parents-info/route.ts` - Parents info
21. `src/app/api/applications/[applicationId]/documents/route.ts` - Documents
22. `src/app/api/applications/[applicationId]/pass/route.ts` - Pass
23. `src/app/api/applications/[applicationId]/attachments/route.ts` - Attachments
24. `src/app/api/applications/[applicationId]/attachments/[nextStageId]/route.ts` - Next stage
25. `src/app/api/applications/[applicationId]/declaration/route.ts` - Declaration (uses helper)
26. `src/app/api/applications/documents/upload/route.ts` - Document upload
27. `src/app/api/applications/documents/[documentId]/route.ts` - Document by ID

## How It Works

1. **At Module Load**: `apiConfig.baseUrl` is initialized with `ensureHttps(getApiUrl())`, ensuring the base URL always uses HTTPS
2. **At Runtime**: All service files that make API calls use `ensureHttps(apiConfig.baseUrl)` before constructing URLs
3. **In Next.js Config**: The rewrites function converts any `http://` URLs to `https://` at build/runtime

## Testing

After implementing this fix:

1. Restart the development server: `npm run dev`
2. Check the browser's Network tab to verify all requests use `https://`
3. Check the server console logs for any `[ensureHttps]` warnings

## Benefits

- **Guaranteed HTTPS**: All API requests will use HTTPS protocol regardless of environment configuration
- **Backward Compatible**: If someone accidentally sets `http://` in `.env`, it will be automatically converted
- **Centralized Logic**: All protocol enforcement logic is in one place (`api-config.ts`)
- **Easy to Maintain**: Future API calls can use the `buildApiUrl()` helper function

## Next Steps

To use this pattern in new code:

```typescript
import { buildApiUrl } from '@/lib/config/api-config';

// Simple usage
const url = buildApiUrl('/applications/lookup');
// Result: https://migrantonline.immigration.go.tz/api/applications/lookup

// Or use ensureHttps directly
import { apiConfig, ensureHttps } from '@/lib/config/api-config';
const apiUrl = ensureHttps(apiConfig.baseUrl);
const response = await fetch(`${apiUrl}/your-endpoint`);
```
