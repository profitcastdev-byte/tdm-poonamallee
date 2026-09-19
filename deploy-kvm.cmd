@echo off
rem Runs deploy/deploy-kvm.sh from PowerShell or cmd, where bash is not on PATH.
rem   .\deploy-kvm.cmd              upload, swap in, verify
rem   .\deploy-kvm.cmd --check      is the KVM running exactly this page? (changes nothing)
rem   .\deploy-kvm.cmd --rollback   swap the previous release back in (run again to undo)
setlocal
set "GITBASH=%ProgramFiles%\Git\bin\bash.exe"
if not exist "%GITBASH%" set "GITBASH=%LOCALAPPDATA%\Programs\Git\bin\bash.exe"
if not exist "%GITBASH%" (
  echo Git Bash not found. Install Git for Windows, or run from Git Bash: bash deploy/deploy-kvm.sh %*
  exit /b 1
)
rem Run from the project root with a relative path: bash resolves $0 cleanly
rem that way, and the folder name's spaces never reach bash.
cd /d "%~dp0"
"%GITBASH%" deploy/deploy-kvm.sh %*
exit /b %ERRORLEVEL%
