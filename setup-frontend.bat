@echo off
echo Creating frontend .env file...
echo.

(
echo VITE_API_URL=http://localhost:5000/api
) > .env

echo .env file created successfully!
echo.
echo Frontend is now configured to connect to backend at http://localhost:5000/api
echo.
echo Make sure the backend server is running before using the frontend.
pause
