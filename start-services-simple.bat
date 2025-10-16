@echo off
echo ====================================
echo   Iniciando OSC Backend Services
echo ====================================
echo.

REM Cambiar al directorio del proyecto
cd /d "%~dp0"

echo [1/3] Iniciando Court Service (puerto 3004)...
start "Court Service" cmd /k "cd osc-backend\court-service && node src\server.js"
timeout /t 3 /nobreak >nul

echo [2/3] Iniciando User Service (puerto 3001)...
start "User Service" cmd /k "cd osc-backend\user-service && node src\server.js"
timeout /t 3 /nobreak >nul

echo [3/3] Iniciando API Gateway (puerto 3000)...
start "API Gateway" cmd /k "cd osc-backend\api-gateway && node stable-server.js"
timeout /t 3 /nobreak >nul

echo.
echo ====================================
echo   Todos los servicios iniciados!
echo ====================================
echo.
echo   - API Gateway:   http://localhost:3000
echo   - User Service:  http://localhost:3001
echo   - Court Service: http://localhost:3004
echo.
echo Presiona cualquier tecla para salir...
pause >nul
