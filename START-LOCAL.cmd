@echo off
setlocal
cd /d "%~dp0"
set "AIRFRAME_NODE="
for /f "delims=" %%N in ('where node 2^>nul') do if not defined AIRFRAME_NODE set "AIRFRAME_NODE=%%N"
if not defined AIRFRAME_NODE if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" set "AIRFRAME_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not defined AIRFRAME_NODE (
  echo This computer needs Node.js 22.13 or newer to run the prediction server.
  echo Install Node.js, then double-click this file again.
  pause
  exit /b 1
)
echo Airframe local website
echo Open http://127.0.0.1:5173 in your browser.
echo Keep this window open while using the website.
echo Press Ctrl+C to stop the local server.
echo.
"%AIRFRAME_NODE%" server.mjs
if errorlevel 1 (
  echo.
  echo If port 5173 is already in use, try opening http://127.0.0.1:5173.
  pause
)
