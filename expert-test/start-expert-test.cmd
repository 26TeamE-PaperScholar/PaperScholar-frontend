@echo off
setlocal
cd /d "%~dp0.."
node "%~dp0start-expert-test.mjs" %*
