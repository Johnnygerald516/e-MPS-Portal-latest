@echo off
echo === API URL Update Verification ===
echo.
echo This script will check if all references to the old API URL have been updated
echo.
echo Old API URL: http://10.6.0.164:30033
echo New API URL: http://10.6.0.167:3300
echo.
pause

echo Running verification script...
node scripts/verify-api-url-update.js

echo.
echo Verification complete!
echo.
pause
