@echo off
echo Starting Smart Zambia...
start "Smart Zambia API" cmd /k "cd smart-zambia-api && npm start"
timeout /t 3 /nobreak >nul
start "Smart Zambia Frontend" cmd /k "cd smart-zambia-frontend && npx http-server -p 8000 -o"
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:8000
