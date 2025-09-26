@echo off
echo === Restarting eMPS Portal with new API URL ===
echo.
echo API URL: http://10.6.0.167:3300
echo.

echo Clearing Next.js cache...
if exist .next (
  rmdir /s /q .next
  echo Cache cleared successfully.
) else (
  echo No cache to clear.
)
echo.

echo Verifying environment variables...
node scripts/check-api-url.js
echo.

echo Starting development server...
npm run dev
