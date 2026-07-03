@echo off
setlocal

cd /d "%~dp0"
title Talent Dashboard Launcher

where node >nul 2>nul
if errorlevel 1 (
  powershell -NoProfile -ExecutionPolicy Bypass -EncodedCommand VwByAGkAdABlAC0ASABvAHMAdAAgACIAIgA7ACAAVwByAGkAdABlAC0ASABvAHMAdAAgACIAL1SoUjFZJY0a/ypnwGhLbTBSIABOAG8AZABlAC4AagBzAAIwIgA7ACAAVwByAGkAdABlAC0ASABvAHMAdAAgACIA94tIUYlbxYggAE4AbwBkAGUALgBqAHMADP82cQ5UzZGwZcxT+1EsZ4dl9k4CMCIAOwAgAFcAcgBpAHQAZQAtAEgAbwBzAHQAIAAiACIAOwAgAFIAZQBhAGQALQBIAG8AcwB0ACAAIgAJY95WZo8ulXNR7ZWXeuNTIgA=
  exit /b 1
)

node "%~dp0scripts\launcher.cjs"

echo.
pause
