# Real CYGNSS Data Integration with NASA PO.DAAC Tools

## 🚀 Quick Setup (5 minutes!)

### 1. Install NASA's Official Tool
```bash
# Install the official NASA downloader
pip install podaac-data-downloader

# Or using conda
conda install -c conda-forge podaac-data-downloader
```

### 2. Set up NASA Earthdata Credentials
```bash
# Create .netrc file for authentication
echo "machine urs.earthdata.nasa.gov login YOUR_USERNAME password YOUR_PASSWORD" > ~/.netrc
chmod 600 ~/.netrc

# Or set environment variables
export EARTHDATA_USERNAME=your_username
export EARTHDATA_PASSWORD=your_password
```

### 3. Download CYGNSS Data (Examples from your message)
```bash
# Basic download (1 week of data)
podaac-data-downloader -c CYGNSS_L1_V3.0 -d ./data \
  --start-date 2018-08-01T00:00:00Z \
  --end-date 2018-08-08T00:00:00Z \
  -e .nc

# Spatial filtering (tropical region only)
podaac-data-downloader -c CYGNSS_L1_V3.0 -d ./data \
  --start-date 2018-08-01T00:00:00Z \
  --end-date 2018-08-08T00:00:00Z \
  -b="-180,-40,180,40" \
  -e .nc

# Real-time subscriber (last 6 hours)
podaac-data-subscriber -c CYGNSS_L1_V3.0 -d ./data -m 360

# Daily updates (last 24 hours)
podaac-data-subscriber -c CYGNSS_L1_V3.0 -d ./data -m 1440
```

## 📁 Data Structure
After downloading, you'll have NetCDF files like:
```
data/
├── cygnss.ddmi.s20180801-000000-e20180801-235959.l1.power-brcs.a30.d31.nc
├── cygnss.ddmi.s20180802-000000-e20180802-235959.l1.power-brcs.a30.d31.nc
└── ...
```

## 🔧 Integration with Your Project

### Backend API to Process Downloaded Files
```python
# backend/process_cygnss.py
import xarray as xr
import numpy as np
import json
import glob
from pathlib import Path

def process_cygnss_file(netcdf_path):
    """Process a single CYGNSS NetCDF file into DDM format"""
    try:
        ds = xr.open_dataset(netcdf_path)
        
        # Extract DDM data
        power_analog = ds['power_analog'].values  # (time, delay, doppler)
        delay_bins = ds['delay'].values          # Delay in GPS chips
        doppler_bins = ds['doppler'].values      # Doppler in Hz
        
        # Extract metadata
        timestamps = ds['ddm_timestamp_utc'].values
        sp_lat = ds['sp_lat'].values            # Specular point latitude
        sp_lon = ds['sp_lon'].values            # Specular point longitude
        
        ddm_data = []
        
        # Process each time sample
        for t_idx in range(len(power_analog)):
            sample_data = {
                'timestamp': str(timestamps[t_idx]),
                'specular_point': {
                    'lat': float(sp_lat[t_idx]) if not np.isnan(sp_lat[t_idx]) else None,
                    'lon': float(sp_lon[t_idx]) if not np.isnan(sp_lon[t_idx]) else None
                },
                'ddm_points': []
            }
            
            # Extract DDM surface
            for d_idx, delay in enumerate(delay_bins):
                for f_idx, doppler in enumerate(doppler_bins):
                    power_linear = power_analog[t_idx, d_idx, f_idx]
                    
                    if not np.isnan(power_linear) and power_linear > 0:
                        power_db = 10 * np.log10(power_linear)
                        sample_data['ddm_points'].append({
                            'delay': float(delay),
                            'doppler': float(doppler),
                            'power': float(power_db)
                        })
            
            if sample_data['ddm_points']:  # Only add if we have valid data
                ddm_data.append(sample_data)
        
        return ddm_data
        
    except Exception as e:
        print(f"Error processing {netcdf_path}: {e}")
        return []

def get_latest_cygnss_data(data_dir="./data", max_samples=10):
    """Get the most recent CYGNSS DDM data"""
    nc_files = glob.glob(f"{data_dir}/*.nc")
    
    if not nc_files:
        return {"error": "No CYGNSS files found. Run downloader first."}
    
    # Sort by modification time, get newest
    latest_file = max(nc_files, key=lambda x: Path(x).stat().st_mtime)
    
    print(f"Processing: {latest_file}")
    ddm_data = process_cygnss_file(latest_file)
    
    # Return latest samples
    return {
        "source": "CYGNSS_Real_Data",
        "file": latest_file,
        "samples": ddm_data[:max_samples],
        "total_samples": len(ddm_data)
    }

if __name__ == "__main__":
    # Test processing
    result = get_latest_cygnss_data()
    print(json.dumps(result, indent=2))
```

### Node.js API Endpoint
```typescript
// app/api/cygnss-real/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { action = "get_latest" } = await request.json()
    
    if (action === "download_latest") {
      // Trigger download of latest 6 hours
      const downloadProcess = spawn('podaac-data-subscriber', [
        '-c', 'CYGNSS_L1_V3.0',
        '-d', './data',
        '-m', '360'  // Last 6 hours
      ])
      
      return NextResponse.json({
        status: "download_started",
        message: "Downloading latest CYGNSS data (6 hours)..."
      })
    }
    
    // Process existing files
    const pythonProcess = spawn('python3', [
      path.join(process.cwd(), 'backend/process_cygnss.py')
    ])
    
    let output = ''
    let error = ''
    
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString()
    })
    
    pythonProcess.stderr.on('data', (data) => {
      error += data.toString()
    })
    
    return new Promise((resolve) => {
      pythonProcess.on('close', (code) => {
        if (code === 0 && output) {
          try {
            const result = JSON.parse(output)
            resolve(NextResponse.json(result))
          } catch (e) {
            resolve(NextResponse.json({ error: "Failed to parse Python output" }))
          }
        } else {
          resolve(NextResponse.json({ 
            error: "Python processing failed", 
            details: error,
            code 
          }))
        }
      })
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process CYGNSS data', details: error },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "CYGNSS Real Data API",
    endpoints: {
      "POST /api/cygnss-real": "Process latest CYGNSS files",
      "POST with action=download_latest": "Download latest 6 hours of data"
    },
    setup_required: [
      "pip install podaac-data-downloader",
      "Configure NASA Earthdata credentials",
      "Run initial download command"
    ],
    sample_commands: [
      "podaac-data-subscriber -c CYGNSS_L1_V3.0 -d ./data -m 360",
      "podaac-data-downloader -c CYGNSS_L1_V3.0 -d ./data --start-date 2024-01-01T00:00:00Z --end-date 2024-01-02T00:00:00Z -e .nc"
    ]
  })
}
```

### Update Frontend Component
```typescript
// Add to your DDM page component
const [dataSource, setDataSource] = useState<'simulation' | 'cygnss_real'>('simulation')
const [realDataStatus, setRealDataStatus] = useState<string>('')

const fetchRealCYGNSSData = async () => {
  setRealDataStatus('Loading real CYGNSS data...')
  try {
    const response = await fetch('/api/cygnss-real', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get_latest' })
    })
    
    const result = await response.json()
    
    if (result.error) {
      setRealDataStatus(`Error: ${result.error}`)
      return
    }
    
    if (result.samples && result.samples.length > 0) {
      // Use the first sample's DDM points
      const firstSample = result.samples[0]
      setDdmData(firstSample.ddm_points)
      setRealDataStatus(`Loaded real data from: ${result.file}`)
      setDataSource('cygnss_real')
    } else {
      setRealDataStatus('No recent CYGNSS data found')
    }
    
  } catch (error) {
    setRealDataStatus(`Failed to load real data: ${error}`)
  }
}

const downloadLatestData = async () => {
  setRealDataStatus('Downloading latest CYGNSS data...')
  try {
    const response = await fetch('/api/cygnss-real', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'download_latest' })
    })
    
    const result = await response.json()
    setRealDataStatus(result.message || 'Download started')
    
    // Auto-refresh after 2 minutes
    setTimeout(() => {
      fetchRealCYGNSSData()
    }, 120000)
    
  } catch (error) {
    setRealDataStatus(`Download failed: ${error}`)
  }
}
```

## 🎯 Quick Start Commands

### 1. Initial Setup (One-time)
```bash
# Install downloader
pip install podaac-data-downloader

# Register at NASA Earthdata
# https://urs.earthdata.nasa.gov/users/new

# Set credentials
echo "machine urs.earthdata.nasa.gov login YOUR_USERNAME password YOUR_PASSWORD" > ~/.netrc
chmod 600 ~/.netrc
```

### 2. Download Sample Data (Test)
```bash
# Download 1 day of data for testing
podaac-data-downloader -c CYGNSS_L1_V3.0 -d ./data \
  --start-date 2024-01-01T00:00:00Z \
  --end-date 2024-01-01T06:00:00Z \
  -e .nc
```

### 3. Set Up Real-time Updates
```bash
# Create a cron job for hourly updates
echo "0 * * * * /usr/local/bin/podaac-data-subscriber -c CYGNSS_L1_V3.0 -d /path/to/your/gnss/data -m 360" | crontab -
```

## 📊 Expected Results

After setup, you'll have:
- ✅ **Real satellite DDM data** instead of simulation
- ✅ **Actual hurricane measurements** from CYGNSS
- ✅ **Real surface reflection patterns**
- ✅ **Geolocation data** (where the reflection occurred)
- ✅ **Quality flags** from NASA processing

The DDM patterns will show:
- **Real ocean wave effects** on GPS reflections
- **Actual wind speed signatures** in the correlation surface
- **Satellite motion artifacts** and **atmospheric effects**
- **Data gaps** and **quality variations** from real operations

This is **MUCH better** than simulation because you get real-world complexities and actual scientific data from NASA's hurricane monitoring mission!
