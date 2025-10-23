@echo off
echo Testing API connection to http://10.6.0.168:30033...
curl -k -I http://10.6.0.168:30033

if %ERRORLEVEL% EQU 0 (
    echo API connection successful!
) else (
    echo API connection failed. Please check if the API server is running and accessible.
)

pause
