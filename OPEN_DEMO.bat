@echo off
echo Opening Log Aggregation Demo...
echo.
echo The demo will open in your default browser.
echo Press Ctrl+C to stop the server when done.
echo.
start http://127.0.0.1:8080
python -m http.server 8080


