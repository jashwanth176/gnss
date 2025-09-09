@echo off
echo NASA CYGNSS Data Downloader - Quick Setup
echo =========================================
echo.

echo Using Python virtual environment from your workspace...
call .venv\Scripts\activate.bat

echo.
echo Starting simple NASA CYGNSS data access...
echo This will either download real data or create realistic structure.
echo.

python simple_cygnss_download.py

echo.
echo Process completed! Check your DDM visualization.
echo.
pause

REM Create data directory
if not exist "data" mkdir data
echo Created data directory: %cd%\data
echo.

REM Check for NASA credentials
if not exist "%USERPROFILE%\.netrc" (
    echo WARNING: NASA Earthdata credentials not found!
    echo Please set up your credentials at: https://urs.earthdata.nasa.gov/users/new
    echo.
    echo After registration, create file: %USERPROFILE%\.netrc
    echo With content:
    echo machine urs.earthdata.nasa.gov login YOUR_USERNAME password YOUR_PASSWORD
    echo.
    pause
)

echo Choose a download option:
echo.
echo 1. Simple download (all data for date range)
echo 2. Spatial and temporal search (hurricane belt region)
echo 3. NetCDF files only
echo 4. Recent data (6 hours)
echo 5. Recent data (24 hours)
echo.
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo Running: Simple download for August 1-8, 2018...
    podaac-data-downloader -c CYGNSS_L1_V3.0 -d ./data --start-date 2018-08-01T00:00:00Z --end-date 2018-08-08T00:00:00Z -e ""
)

if "%choice%"=="2" (
    echo Running: Spatial and temporal search...
    podaac-data-downloader -c CYGNSS_L1_V3.0 -d ./data --start-date 2018-08-01T00:00:00Z --end-date 2018-08-08T00:00:00Z -b="-180,-40,180,40"
)

if "%choice%"=="3" (
    echo Running: NetCDF files only...
    podaac-data-downloader -c CYGNSS_L1_V3.0 -d ./data --start-date 2018-08-01T00:00:00Z --end-date 2018-08-08T00:00:00Z -e .nc
)

if "%choice%"=="4" (
    echo Running: Recent data (360 minutes)...
    podaac-data-subscriber -c CYGNSS_L1_V3.0 -d ./data -m 360
)

if "%choice%"=="5" (
    echo Running: Recent data (1440 minutes)...
    podaac-data-subscriber -c CYGNSS_L1_V3.0 -d ./data -m 1440
)

if exist "data\*.nc" (
    echo.
    echo Download completed! Processing data for DDM visualization...
    python scripts\process_cygnss_data.py -d ./data -o ./public/cygnss_data.json
    echo.
    echo Data processing complete! Your Next.js app can now use real CYGNSS data.
    echo Visit: http://localhost:3000/delay-doppler-maps and click "Try Real Data"
) else (
    echo.
    echo No NetCDF files found. Check your NASA credentials and try again.
)

echo.
pause
