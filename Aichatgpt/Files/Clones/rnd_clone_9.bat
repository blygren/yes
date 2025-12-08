@echo off
powershell -ExecutionPolicy Bypass -File "%~dp0rainbow.ps1"
if %errorlevel% neq 0 pause