@echo off
REM Build a single-file MycelialArchive.exe for Windows
setlocal
cd /d "%~dp0"

echo [build] installing build deps...
python -m pip install --quiet --user pyinstaller
python -m pip install --quiet --user -r backend\requirements.txt

echo [build] building frontend...
cd frontend
if not exist node_modules call yarn install --silent
call yarn build
cd ..

echo [build] running PyInstaller...
python -m PyInstaller --clean --noconfirm mycelial.spec

echo.
echo [build] done -> dist\MycelialArchive.exe
