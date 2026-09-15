@echo off
REM =========================================================================
REM Shop Billing POS - 1-Click Windows Local Setup & Launch Script
REM =========================================================================
title Shop Billing System - Offline POS

echo.
echo =========================================================================
echo       SHOP BILLING SYSTEM - LOCAL WINDOWS INSTALLATION & LAUNCHER        
echo =========================================================================
echo.
echo Checking Node.js runtime on your computer...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please download and install Node.js from https://nodejs.org/ (LTS version)
    echo Then double-click this start-pos.bat file again.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js is detected.
echo.
echo Installing dependencies (if needed)...
if not exist node_modules (
    echo Installing required packages...
    call npm install
) else (
    echo [OK] Dependencies are already present.
)

echo.
echo Starting Shop Billing System POS Server on http://localhost:3000...
echo You can open this in Chrome, Edge, or package with Electron.
echo.
start http://localhost:3000
call npm run dev

pause
