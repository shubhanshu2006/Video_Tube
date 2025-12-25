@echo off
echo ========================================
echo   VideoTube - Quick Start Script
echo ========================================
echo.

:menu
echo What would you like to do?
echo.
echo 1. Install Frontend Dependencies
echo 2. Install Backend Dependencies
echo 3. Start Backend Server
echo 4. Start Frontend Server
echo 5. Start Both (Backend + Frontend)
echo 6. Build Frontend for Production
echo 7. Exit
echo.

set /p choice="Enter your choice (1-7): "

if "%choice%"=="1" goto install_frontend
if "%choice%"=="2" goto install_backend
if "%choice%"=="3" goto start_backend
if "%choice%"=="4" goto start_frontend
if "%choice%"=="5" goto start_both
if "%choice%"=="6" goto build_frontend
if "%choice%"=="7" goto end

echo Invalid choice, please try again.
echo.
goto menu

:install_frontend
echo.
echo Installing Frontend Dependencies...
cd Frontend
call npm install
cd ..
echo.
echo Frontend dependencies installed successfully!
echo.
pause
goto menu

:install_backend
echo.
echo Installing Backend Dependencies...
cd Backend
call npm install
cd ..
echo.
echo Backend dependencies installed successfully!
echo.
pause
goto menu

:start_backend
echo.
echo Starting Backend Server...
echo Backend will run on http://localhost:8000
echo.
cd Backend
call npm run dev
cd ..
pause
goto menu

:start_frontend
echo.
echo Starting Frontend Server...
echo Frontend will run on http://localhost:5173
echo.
cd Frontend
call npm run dev
cd ..
pause
goto menu

:start_both
echo.
echo Starting Both Backend and Frontend...
echo.
echo Opening Backend in new window...
start cmd /k "cd Backend && npm run dev"
timeout /t 3 /nobreak > nul
echo.
echo Opening Frontend in new window...
start cmd /k "cd Frontend && npm run dev"
echo.
echo Both servers are starting in separate windows!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
pause
goto menu

:build_frontend
echo.
echo Building Frontend for Production...
cd Frontend
call npm run build
echo.
echo Build complete! Check the 'dist' folder.
cd ..
pause
goto menu

:end
echo.
echo Thank you for using VideoTube!
echo.
pause
exit
