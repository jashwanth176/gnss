# 🛰️ CYGNSS Real Data Integration - Quick Start

## 🚀 One-Click Setup (Windows)

1. **Run the automated script:**
   ```cmd
   download_cygnss_data.bat
   ```

2. **Or manually run your commands:**
   ```bash
   # Simple download
   podaac-data-downloader -c CYGNSS_L1_V3.0 -d ./data --start-date 2018-08-01T00:00:00Z --end-date 2018-08-08T00:00:00Z -e ""

   # Spatial and temporal search 
   podaac-data-downloader -c CYGNSS_L1_V3.0 -d ./data --start-date 2018-08-01T00:00:00Z --end-date 2018-08-08T00:00:00Z -b="-180,-40,180,40"

   # NetCDF files only
   podaac-data-downloader -c CYGNSS_L1_V3.0 -d ./data --start-date 2018-08-01T00:00:00Z --end-date 2018-08-08T00:00:00Z -e .nc

   # Recent data (6 hours)
   podaac-data-subscriber -c CYGNSS_L1_V3.0 -d ./data -m 360

   # Recent data (24 hours)  
   podaac-data-subscriber -c CYGNSS_L1_V3.0 -d ./data -m 1440
   ```

3. **Process the data:**
   ```bash
   python scripts/process_cygnss_data.py -d ./data -o ./public/cygnss_data.json
   ```

4. **Use real data in your app:**
   - Go to http://localhost:3000/delay-doppler-maps
   - Click **"📡 Try Real Data"** button
   - See actual NASA satellite measurements!

## 📋 Prerequisites

- NASA Earthdata account: https://urs.earthdata.nasa.gov/users/new
- Python with: `pip install podaac-data-downloader netCDF4 xarray`

## 🎯 What You Get

- **Real CYGNSS satellite data** from NASA's hurricane monitoring constellation
- **Actual delay-doppler maps** from ocean surface reflections  
- **No more simulation** - pure satellite measurements
- **Hurricane tracking data** from 2018-2025

## 🔧 File Structure After Setup

```
D:\gnss\
├── data/                          # Downloaded NetCDF files
│   └── *.nc                      # CYGNSS Level 1 data
├── public/
│   └── cygnss_data.json          # Processed DDM data for Next.js
├── scripts/
│   └── process_cygnss_data.py    # Data processing script
└── download_cygnss_data.bat      # One-click setup script
```

## ✅ Verification

After setup, your DDM page will show:
- **🛰️ Real CYGNSS Data** instead of **🎯 Simulated Data**
- Actual timestamps from satellite passes
- Real power measurements in dB
- Scientific quality delay-doppler maps

Ready to use **real satellite data instead of simulations**! 🌊📡
