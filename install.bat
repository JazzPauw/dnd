@echo off
REM The Mycelial Archive — Windows one-time installer
setlocal
cd /d "%~dp0"

echo [mycelium] installing backend deps...
python -m pip install --user -r backend\requirements.txt || goto :fail

echo [mycelium] building frontend...
cd frontend
where yarn >nul 2>nul
if errorlevel 1 (
  echo [!] yarn not found. Install Node 18+ and run: npm i -g yarn
  goto :fail
)
call yarn install --silent || goto :fail
call yarn build || goto :fail
cd ..

echo.
echo [mycelium] installed.
echo          Run:       python launcher.py
echo          Shortcut:  python create_shortcut.py
echo          Data:      %%USERPROFILE%%\.mycelial-archive\
goto :eof

:fail
echo [!] install failed.
exit /b 1
