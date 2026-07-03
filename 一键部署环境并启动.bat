@echo off
setlocal

cd /d "%~dp0"
title Talent Dashboard Setup and Launcher

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\setup-and-launch.ps1"

echo.
pause
