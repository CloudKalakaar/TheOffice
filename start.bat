@echo off
title The Office
echo ========================================================
echo   Starting The Office
echo ========================================================
echo.
echo Launching local server at http://localhost:8000 ...
echo.
start http://localhost:8000
python -m http.server 8000
pause
