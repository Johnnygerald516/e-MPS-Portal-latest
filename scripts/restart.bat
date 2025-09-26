@echo off
echo === eMPS Portal Restart Script ===
echo.

echo Checking environment variables...
node scripts/verify-env.js
echo.

echo Cleaning Next.js cache...
if exist .next (
  rmdir /s /q .next
  echo Cache cleared successfully.
) else (
  echo No cache to clear.
)
echo.

echo Starting development server...
npm run dev
