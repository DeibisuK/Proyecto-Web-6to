@echo off
echo ============================================================
echo   OSC Project - Start Backend and Frontend
echo ============================================================
echo.

echo Starting Backend...
start cmd /k "npm run start:backend"

timeout /t 5 /nobreak > nul

echo.
echo Starting Frontend...
cd OSC-Frontend-Angular
start cmd /k "npm install && ng serve --open"

echo.
echo ============================================================
echo   Both terminals opened!
echo   Backend: New window
echo   Frontend: New window
echo ============================================================
echo.
pause
