@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Opening the offline edition instead.
  start "" "dist\offline.html"
  pause
  exit /b 0
)
call npm run build
if errorlevel 1 (pause & exit /b 1)
echo Open http://127.0.0.1:8000 in your browser. Keep this window open.
call npm start
pause
