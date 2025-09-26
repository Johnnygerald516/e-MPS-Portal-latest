@echo off
echo === Restarting eMPS Portal with Fixed Endpoints ===
echo.
echo API URL: %NEXT_PUBLIC_API_URL%
echo.

echo Clearing Next.js cache...
if exist .next (
  rmdir /s /q .next
  echo Cache cleared successfully.
) else (
  echo No cache to clear.
)
echo.

echo Starting development server...
npm run dev
