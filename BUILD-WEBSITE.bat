@echo off
setlocal EnableExtensions
set "PROJECT_DIR=%~dp0"
set "PUBLISH_DIR=%~dp0PUBLISH-THIS-FOLDER"
cd /d "%PROJECT_DIR%"

where node >nul 2>nul
if errorlevel 1 goto :node_missing
where npm >nul 2>nul
if errorlevel 1 goto :node_missing
node -e "const [major, minor] = process.versions.node.split('.').map(Number); process.exit(major > 22 || (major === 22 && minor >= 22) ? 0 : 1)"
if errorlevel 1 goto :node_old

if not exist "node_modules\" (
  echo.
  echo Setting up the website builder for the first time. This may take a few minutes.
  call npm ci
  if errorlevel 1 goto :install_failed
)

echo.
echo Checking and building the website for publication...
call npm run verify
if errorlevel 1 goto :build_failed

if exist "%PUBLISH_DIR%\" rmdir /s /q "%PUBLISH_DIR%"
if exist "%PUBLISH_DIR%\" goto :copy_failed
mkdir "%PUBLISH_DIR%"
if errorlevel 1 goto :copy_failed
xcopy "%PROJECT_DIR%dist\*" "%PUBLISH_DIR%\" /E /I /H /Y >nul
if errorlevel 1 goto :copy_failed

echo.
echo Upload the contents of PUBLISH-THIS-FOLDER when using manual hosting.
echo GitHub-connected Netlify publication does not require this manual folder.
pause
exit /b 0

:node_missing
echo.
echo Building this website needs Node.js LTS installed once on this computer.
echo Download and install the current LTS version from https://nodejs.org/, then try again.
pause
exit /b 1

:node_old
echo.
echo This computer has an older Node.js version that this website no longer supports.
echo Install the current Node.js LTS version from https://nodejs.org/, then try again.
pause
exit /b 1

:install_failed
echo.
echo The website setup did not finish. Check your internet connection and try again.
pause
exit /b 1

:build_failed
echo.
echo The website checks or production build did not finish. Nothing has been published.
pause
exit /b 1

:copy_failed
echo.
echo The build completed, but the publish folder could not be created.
pause
exit /b 1
