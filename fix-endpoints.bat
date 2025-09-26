@echo off
echo === eMPS Portal Endpoint Fix ===
echo.
echo This script will fix all API endpoints to use environment variables
echo.
pause

echo Running endpoint fix script...
node scripts/complete-endpoint-fix.js

echo.
echo Fix complete! 
echo.
echo Next steps:
echo 1. Check the output above for any errors
echo 2. Restart your development server
echo 3. Test your application
echo.
pause
