@echo off
setlocal EnableExtensions
set "PROJECT_DIR=%~dp0"
cd /d "%PROJECT_DIR%"

where powershell >nul 2>nul
if errorlevel 1 goto :powershell_missing

powershell -NoProfile -ExecutionPolicy Bypass -Command "& { param([string]$ProjectPath) $ErrorActionPreference = 'Stop'; $project = (Resolve-Path -LiteralPath $ProjectPath).Path; $output = Join-Path $project 'AI-COPY'; $stage = Join-Path $output '.source-staging'; $archive = Join-Path $output 'recovery-dharma-atlantis-source.zip'; $skipFolders = @('node_modules','dist','PUBLISH-THIS-FOLDER','AI-COPY','.git','.vscode','.idea','.vs','.cache','coverage','screenshots','review-artifacts','playwright-report','test-results'); $skipFiles = @('.DS_Store','Thumbs.db','desktop.ini'); New-Item -ItemType Directory -Force -Path $output | Out-Null; if (Test-Path -LiteralPath $stage) { Remove-Item -LiteralPath $stage -Recurse -Force }; if (Test-Path -LiteralPath $archive) { Remove-Item -LiteralPath $archive -Force }; New-Item -ItemType Directory -Force -Path $stage | Out-Null; Get-ChildItem -LiteralPath $project -Force -Recurse -File | ForEach-Object { $relative = $_.FullName.Substring($project.Length).TrimStart([char[]]'\/'); $parts = $relative -split '[\\/]'; $skip = ($parts | Where-Object { $skipFolders -contains $_ }).Count -gt 0; $isLocalArtifact = $_.Name -like '*.log' -or $_.Name -like '*.tmp' -or $_.Name -like '*.code-workspace'; if (-not $skip -and -not $isLocalArtifact -and $skipFiles -notcontains $_.Name -and $_.Name -notlike '.env*') { $destination = Join-Path $stage $relative; $destinationFolder = Split-Path -Parent $destination; New-Item -ItemType Directory -Force -Path $destinationFolder | Out-Null; Copy-Item -LiteralPath $_.FullName -Destination $destination -Force } }; if (-not (Get-ChildItem -LiteralPath $stage -Recurse -File | Select-Object -First 1)) { throw 'No source files were found to archive.' }; Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory($stage, $archive, [System.IO.Compression.CompressionLevel]::Optimal, $false); Remove-Item -LiteralPath $stage -Recurse -Force; Write-Host ''; Write-Host ('Created: ' + $archive); Write-Host 'Attach this ZIP to the AI. The project includes AI_READ_FIRST.txt, DESIGN_GUIDE.md, CONTENT_GUIDE.md, MY_WEBSITE_FACTS.txt, and CHANGE_REQUEST.txt.' }" "%PROJECT_DIR%"

if errorlevel 1 goto :failed
echo.
echo This is the ZIP to attach to the AI.
pause
exit /b 0

:powershell_missing
echo.
echo Windows PowerShell is needed to create the source ZIP, but it was not found.
echo No archive was created. Ask a trusted technical helper to look at this window.
pause
exit /b 1

:failed
echo.
echo The AI source ZIP could not be created. Nothing was sent or published.
echo Ask a trusted technical helper to look at this window if it keeps failing.
pause
exit /b 1
