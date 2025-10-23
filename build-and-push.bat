@echo off
setlocal

:: Set variables
set VERSION=v0.0.7
set REGISTRY=41.59.104.107:30000
set IMAGE_NAME=migrant-fe-portal
set FULL_IMAGE_NAME=%REGISTRY%/%IMAGE_NAME%:%VERSION%

echo Building and pushing Docker image for %IMAGE_NAME%:%VERSION%

:: Build the Docker image with the production API URL
echo Building Docker image...
docker build --build-arg NEXT_PUBLIC_API_URL=https://migrantonline.immigration.go.tz/api -t %FULL_IMAGE_NAME% .

IF %ERRORLEVEL% NEQ 0 (
    echo Error building Docker image
    pause
    exit /b %ERRORLEVEL%
)

:: Push the image to the registry
echo Pushing Docker image to registry...
docker push %FULL_IMAGE_NAME%

IF %ERRORLEVEL% NEQ 0 (
    echo Error pushing Docker image to registry
    echo Make sure you have access to the registry at %REGISTRY%
    pause
    exit /b %ERRORLEVEL%
)

echo Image successfully built and pushed to %FULL_IMAGE_NAME%
echo.
echo Container port: 3100
echo API endpoint: https://migrantonline.immigration.go.tz/api
echo.
echo To run this image locally: docker run -p 3100:3100 %FULL_IMAGE_NAME%
pause
