@echo off
echo ===== eMPS Portal Deployment Script =====
echo.

REM Check if .env.production exists
if not exist .env.production (
  echo ERROR: .env.production file not found!
  echo Please create a .env.production file with your environment variables.
  echo Example:
  echo NEXT_PUBLIC_API_URL=http://your-api-url
  echo NEXT_PUBLIC_API_KEY=your-api-key
  exit /b 1
)

REM Build the application
echo Building the application...
call npm run build:prod
if %ERRORLEVEL% neq 0 (
  echo ERROR: Build failed!
  exit /b 1
)

REM Check if PM2 is installed
where pm2 >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo ERROR: PM2 is not installed or not in PATH!
  echo Please install PM2 globally with: npm install -g pm2
  exit /b 1
)

REM Stop existing PM2 process if it exists
echo Stopping existing PM2 process if running...
call pm2 stop nextapp 2>nul
call pm2 delete nextapp 2>nul

REM Start the application with PM2
echo Starting the application with PM2...
call pm2 start ecosystem.config.js
if %ERRORLEVEL% neq 0 (
  echo ERROR: Failed to start application with PM2!
  exit /b 1
)

REM Save PM2 process list
echo Saving PM2 process list...
call pm2 save

echo.
echo ===== Deployment Complete =====
echo The application is now running with PM2.
echo To check logs, use: pm2 logs nextapp
echo To restart the application, use: pm2 restart nextapp
echo To stop the application, use: pm2 stop nextapp
echo.
