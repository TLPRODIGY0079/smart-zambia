@echo off
echo ========================================
echo Smart Zambia - Complete Setup
echo ========================================
echo.

REM Check if PostgreSQL is installed
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] PostgreSQL is not installed or not in PATH
    echo Please install PostgreSQL from: https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo [1/5] Creating database...
psql -U postgres -c "DROP DATABASE IF EXISTS smart_zambia;"
psql -U postgres -c "CREATE DATABASE smart_zambia;"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create database. Check PostgreSQL password.
    pause
    exit /b 1
)

echo [2/5] Running schema...
psql -U postgres -d smart_zambia -f smart-zambia-api\schema.sql
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to run schema
    pause
    exit /b 1
)

echo [3/5] Installing backend dependencies...
cd smart-zambia-api
if not exist node_modules (
    call npm install
)
cd ..

echo [4/5] Starting backend server...
start "Smart Zambia API" cmd /k "cd smart-zambia-api && npm start"
timeout /t 3 /nobreak >nul

echo [5/5] Starting frontend...
start "Smart Zambia Frontend" cmd /k "cd smart-zambia-frontend && npx http-server -p 8000 -o"

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo Backend API: http://localhost:3001
echo Frontend: http://localhost:8000
echo Admin Panel: http://localhost:8000/admin.html
echo.
echo Press any key to exit...
pause >nul
