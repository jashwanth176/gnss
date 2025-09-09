# GNSS-R Real Data Integration Guide

## 🌊 What is GNSS-R?
Global Navigation Satellite System Reflectometry (GNSS-R) uses GPS signals reflected off Earth's surface to study ocean conditions, soil moisture, and ice coverage. Delay-Doppler Maps (DDMs) visualize these reflected signals.

## 📡 FREE Data Sources

### 1. NASA CYGNSS (Recommended for Ocean Data)
**Best for: Ocean wind speed, hurricane monitoring**

- **Website**: https://podaac.jpl.nasa.gov/dataset/CYGNSS_L1_V3.0
- **Registration**: https://urs.earthdata.nasa.gov/users/new (FREE)
- **Coverage**: Tropical and subtropical oceans (±38° latitude)
- **Update Frequency**: Every ~1 second
- **Data Delay**: 3-6 hours from real-time
- **File Format**: NetCDF (.nc)
- **Constellation**: 8 microsatellites

**What you get:**
- Raw delay-doppler correlation surfaces
- Geolocation (lat/lon of reflection points)
- Wind speed estimates
- Quality flags

**API Access**: Available through NASA's CMR API

### 2. ESA TechDemoSat-1 (TDS-1)
**Best for: Historical GNSS-R research**

- **Website**: https://earth.esa.int/eogateway/catalog/tds-1-gnss-r-data
- **Registration**: ESA Earthnet account (FREE)
- **Coverage**: Global
- **Status**: Mission ended (historical data only)
- **File Format**: NetCDF

### 3. GNOS-R (Chinese Academy of Sciences)
**Best for: Global land/ocean coverage**

- **Website**: http://www.gnos.ac.cn/
- **Registration**: Research agreement required (FREE for academic use)
- **Coverage**: Global
- **File Format**: HDF5/NetCDF

### 4. SMAP-R (NASA)
**Best for: Soil moisture applications**

- **Website**: https://nsidc.org/data/smap
- **Registration**: NASA Earthdata account (FREE)
- **Focus**: Land surface soil moisture

## 💰 Commercial Data Sources

### Spire Global
- **Website**: https://spire.com/weather/
- **Coverage**: Global, real-time
- **Cost**: Commercial pricing
- **API**: Available for enterprise customers

## 🛠️ Technical Implementation

### Step 1: Registration & Access
```bash
# 1. Register for NASA Earthdata account
# Visit: https://urs.earthdata.nasa.gov/users/new

# 2. Get API credentials
# Visit: https://wiki.earthdata.nasa.gov/display/EL/How+To+Access+Data+With+cURL+And+Wget

# 3. Install data processing tools
pip install netcdf4 xarray numpy requests
```

### Step 2: Download CYGNSS Data
```python
import requests
import xarray as xr
import numpy as np
from datetime import datetime, timedelta

# Download CYGNSS file (example)
def download_cygnss_data(start_date, end_date):
    # Use NASA's CMR API to find files
    cmr_url = "https://cmr.earthdata.nasa.gov/search/granules.json"
    params = {
        'collection_concept_id': 'C1996881146-POCLOUD',  # CYGNSS L1 V3.0
        'temporal': f"{start_date}/{end_date}",
        'page_size': 100
    }
    
    response = requests.get(cmr_url, params=params)
    files = response.json()['feed']['entry']
    
    # Download first file as example
    if files:
        download_url = files[0]['links'][0]['href']
        # Use wget or requests with NASA credentials
        return download_url
    return None
```

### Step 3: Parse DDM Data
```python
def parse_cygnss_to_ddm(netcdf_file):
    """Convert CYGNSS NetCDF to DDM format for visualization"""
    ds = xr.open_dataset(netcdf_file)
    
    # Extract DDM power data (samples × delay_bins × doppler_bins)
    power_analog = ds['power_analog'].values
    delay_bins = ds['delay'].values  # In GPS code chips
    doppler_bins = ds['doppler'].values  # In Hz
    
    ddm_points = []
    
    # Process first sample as example
    sample_idx = 0
    if sample_idx < len(power_analog):
        for i, delay in enumerate(delay_bins):
            for j, doppler in enumerate(doppler_bins):
                power_linear = power_analog[sample_idx, i, j]
                if power_linear > 0:  # Valid data
                    power_db = 10 * np.log10(power_linear)
                    ddm_points.append({
                        'delay': float(delay),
                        'doppler': float(doppler),
                        'power': float(power_db)
                    })
    
    return ddm_points

# Quality control
def validate_ddm_quality(ddm_data):
    """Check data quality and flag issues"""
    if not ddm_data:
        return False, "No data points"
    
    powers = [d['power'] for d in ddm_data]
    peak_power = max(powers)
    mean_power = sum(powers) / len(powers)
    
    if peak_power < 10:
        return False, "Low signal strength"
    if mean_power < 0:
        return False, "Invalid power values"
    
    return True, "Data quality good"
```

### Step 4: Frontend Integration
```typescript
// Update your React component to use real data
const fetchRealDDMData = async () => {
  try {
    const response = await fetch('/api/cygnss', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start_time: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        end_time: new Date().toISOString(),
        region: 'tropical_atlantic'  // Hurricane-prone area
      })
    });
    
    const data = await response.json();
    return data.ddm_points || [];
  } catch (error) {
    console.error('Failed to fetch real DDM data:', error);
    return [];
  }
};

// In your component
useEffect(() => {
  if (useRealData) {
    fetchRealDDMData().then(setDdmData);
  }
}, [useRealData]);
```

## 🔧 Data Processing Pipeline

### Backend Setup (Next.js API Route)
```typescript
// app/api/cygnss/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { downloadCYGNSSData, parseToDDM } from '@/lib/cygnss-processor'

export async function POST(request: NextRequest) {
  const { start_time, end_time, region } = await request.json()
  
  try {
    // 1. Query NASA CMR for available files
    const files = await findCYGNSSFiles(start_time, end_time, region)
    
    // 2. Download and cache NetCDF data
    const netcdfData = await downloadCYGNSSData(files[0])
    
    // 3. Parse to DDM format
    const ddmPoints = await parseToDDM(netcdfData)
    
    // 4. Apply quality control
    const { isValid, issues } = validateQuality(ddmPoints)
    
    return NextResponse.json({
      data: ddmPoints,
      metadata: {
        source: 'CYGNSS',
        timestamp: new Date().toISOString(),
        quality: { isValid, issues },
        count: ddmPoints.length
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process CYGNSS data' },
      { status: 500 }
    )
  }
}
```

## 📊 Data Characteristics

### CYGNSS DDM Specifications
- **Delay Range**: 0-20 GPS code chips (~0-6 km surface distance)
- **Doppler Range**: ±500 Hz
- **Resolution**: 17 delay × 11 Doppler bins (standard)
- **Temporal Resolution**: ~1 second
- **Spatial Resolution**: ~25 km footprint
- **SNR Range**: Typically 0-50 dB

### Expected Data Patterns
- **Ocean**: Strong specular peak, wind-dependent spreading
- **Land**: Diffuse scattering, lower coherence
- **Ice**: Strong coherent reflections
- **Mixed surfaces**: Complex multi-modal patterns

## 🚀 Production Deployment

### Environment Variables
```bash
# .env.local
NASA_EARTHDATA_USERNAME=your_username
NASA_EARTHDATA_PASSWORD=your_password
CYGNSS_API_KEY=your_api_key
DATA_CACHE_DIR=/path/to/cache
```

### Caching Strategy
```typescript
// Implement Redis or file-based caching
const cacheKey = `cygnss:${start_time}:${end_time}:${region}`
const cachedData = await redis.get(cacheKey)
if (cachedData) {
  return JSON.parse(cachedData)
}

// Process new data and cache for 1 hour
const newData = await processCYGNSSData(params)
await redis.setex(cacheKey, 3600, JSON.stringify(newData))
```

## 📈 Cost Analysis

| Data Source | Cost | Update Frequency | Coverage | Best For |
|-------------|------|------------------|----------|----------|
| CYGNSS | FREE | 3-6 hour delay | Tropical oceans | Hurricane research |
| TDS-1 | FREE | Historical only | Global | Algorithm development |
| GNOS-R | FREE* | Variable | Global | Academic research |
| Spire | $$$$ | Real-time | Global | Commercial applications |

*Requires research agreement

## 🎯 Recommended Approach

### For Learning/Development:
1. Start with the current simulation (already implemented)
2. Download sample CYGNSS files manually
3. Implement local NetCDF parsing
4. Test with historical data

### For Production:
1. Register for NASA Earthdata account
2. Set up automated CYGNSS data pipeline
3. Implement quality control and validation
4. Add real-time monitoring and alerts
5. Consider commercial sources for low-latency needs

## 📚 Additional Resources

- **NASA CYGNSS Science Team**: https://clasp.engin.umich.edu/research/space-and-planetary/cygnss/
- **GNSS-R Tutorial**: https://www.cosmic.ucar.edu/what-we-do/gnss-radio-occultation/
- **NetCDF Documentation**: https://docs.xarray.dev/en/stable/
- **ESA GNSS-R Portal**: https://earth.esa.int/eogateway/activities/gnss-r

---

**Note**: This guide provides the technical foundation for real data integration. Production implementation requires careful consideration of data licensing, storage, processing costs, and real-time requirements.
