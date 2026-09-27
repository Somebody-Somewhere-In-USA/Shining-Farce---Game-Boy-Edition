@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Node.js is required for this developer tool. It is NOT required to play the game.
 echo Install Node.js through your normal developer setup, then try again.
 pause
 exit /b 1
)
node tools\update-asset-catalog.cjs
set "catalog_result=%errorlevel%"
if "%catalog_result%"=="0" echo COMPLETE: all cataloged assets are valid.
if "%catalog_result%"=="2" echo COMPLETE WITH QUARANTINED FILES: see assets\battle-scene\catalog-report.txt
if "%catalog_result%"=="1" echo FAILED: read the error above. No source artwork was changed.
pause
exit /b %catalog_result%
