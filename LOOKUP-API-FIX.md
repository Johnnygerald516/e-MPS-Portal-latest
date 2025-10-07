# Lookup API Fix

## Problem
The lookup API route was experiencing a "Cannot call API recursively" error because it was trying to call itself when using the same hostname and path.

## Solution
1. Updated the lookup API route to use the correct API endpoint path:
   - Changed from `/api/lookup` to `/applications/lookup`
   - Improved the recursive call detection logic to be more precise

2. Added detailed debugging information to help diagnose issues:
   - Logging of request URLs
   - Logging of API URLs being used
   - Logging of recursive call detection

3. Removed LOOKUP_API_URL environment variable references:
   - Updated check-env-variables.js
   - Updated create-env.js
   - Simplified the configuration to use only NEXT_PUBLIC_API_URL

4. Created a test script to verify the lookup API is working:
   - Added scripts/test-lookup-api.js
   - Added npm run test-lookup command

## How to Test
1. Run the development server:
   ```
   npm run dev
   ```

2. Test the lookup API:
   ```
   npm run test-lookup
   ```

## Implementation Details
The lookup API route now uses the NEXT_PUBLIC_API_URL environment variable to make requests to the external API. It properly detects and prevents recursive calls by comparing the request URL with the target URL.

The recursive call detection logic has been improved to be more precise, only blocking calls that would result in an infinite loop.
