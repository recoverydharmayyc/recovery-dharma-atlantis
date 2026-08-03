@echo off
setlocal EnableExtensions
set "PROJECT_DIR=%~dp0"
cd /d "%PROJECT_DIR%"

where node >nul 2>nul
if errorlevel 1 goto :node_missing
where npm >nul 2>nul
if errorlevel 1 goto :node_missing

if not exist "node_modules\" (
  echo.
  echo Setting up this website preview for the first time. This may take a few minutes.
  call npm ci
  if errorlevel 1 goto :install_failed
)

echo.
echo Opening the local website preview. Closing this window stops the preview.
echo The browser will open at the address printed below.
call npm run dev -- --host 127.0.0.1 --open
echo.
echo The local preview has stopped.
pause
exit /b 0

:node_missing
echo.
echo This website preview needs Node.js LTS installed once on this computer.
echo Download and install the current LTS version from https://nodejs.org/, then try again.
pause
exit /b 1

:install_failed
echo.
echo The website setup did not finish. Check your internet connection and try again.
echo If it still fails, ask a trusted technical helper to look at this window.
pause
exit /b 1
