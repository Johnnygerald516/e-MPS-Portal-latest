# Centralized API Configuration - Summary

## What Changed

Your application now uses a **single `.env` file** as the source of truth for all API configuration.

## Files Modified

### 1. `/src/lib/config/api-config.ts`
**Before:** Had hardcoded fallback URL `http://10.252.0.4:3300`
**After:** Reads only from `NEXT_PUBLIC_API_URL`, throws error if not set

### 2. `/src/lib/utils/api-url-helper.ts`
**Before:** Had hardcoded `PRODUCTION_API_URL = 'https://migrantonline.immigration.go.tz/api'`
**After:** Removed constant, reads only from environment variable

### 3. `/src/app/api/applications/lookup/route.ts`
**Before:** Had fallback `|| 'https://migrantonline.immigration.go.tz/api'`
**After:** Returns error if `NEXT_PUBLIC_API_URL` not set

## Files Created

1. **`env.example`** - Template for environment variables
2. **`ENVIRONMENT_SETUP.md`** - Complete setup guide
3. **`CENTRALIZED_CONFIG_SUMMARY.md`** - This file

## How It Works Now

```
┌─────────────────────────┐
│   .env                  │  ← SINGLE SOURCE OF TRUTH
│                         │
│ NEXT_PUBLIC_API_URL     │  → API Base URL
│ NEXT_PUBLIC_APP_VERSION │  → Version Display
│ NEXT_PUBLIC_APP_NAME    │  → App Name
│ NEXT_PUBLIC_BUILD_DATE  │  → Build Date
└──────────┬──────────────┘
           │
           ├──→ api-config.ts (API URL)
           ├──→ api-url-helper.ts (API URL)
           ├──→ All API routes
           ├──→ All components
           ├──→ Footer (Version info)
           └──→ All services
```

## Benefits

✅ **Single source of truth** - Change API URL in one place (.env)
✅ **No hardcoded URLs** - All URLs come from environment
✅ **Fail-fast** - Clear errors if configuration missing
✅ **Environment-specific** - Different .env files for dev/prod
✅ **Professional** - Industry standard configuration pattern
✅ **Secure** - .env files not committed to git
✅ **Version control** - Manage app version from .env
✅ **Easy updates** - Update version/build date without code changes

## Next Steps

1. **Create your `.env` file:**
   ```bash
   cp env.example .env
   ```

2. **Set your configuration:**
   ```bash
   # Edit .env
   NEXT_PUBLIC_API_URL=http://your-api-server:port
   NEXT_PUBLIC_APP_VERSION=1.0.0
   NEXT_PUBLIC_APP_NAME=eMPS Portal
   NEXT_PUBLIC_BUILD_DATE=2026-03-29
   ```

3. **Test the application:**
   ```bash
   npm run build
   npm start
   ```

4. **For production deployment:**
   - Create `.env.production` on server
   - Set `NEXT_PUBLIC_API_URL` to production API
   - Deploy as usual (PM2 or IIS)

## Validation

The application will now:
- ❌ **Fail to start** if `NEXT_PUBLIC_API_URL` is not set
- ✅ **Show clear error** message telling you what to fix
- ✅ **Log the API URL** on startup for verification

## Migration Complete

All hardcoded API URLs have been removed. Your configuration is now centralized and professional.
