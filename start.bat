@echo off
echo Starting PrintNow Microservices & Frontend...
echo Installing dependencies if missing...

:: This assumes npm install was already run in the root which has concurrently
call npm install

:: Run concurrently
npm start
