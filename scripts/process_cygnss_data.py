#!/usr/bin/env python3
"""
CYGNSS Data Processing Script for DDM Visualization
Processes downloaded NetCDF files and creates JSON data for the Next.js app
"""

import os
import json
import numpy as np
from datetime import datetime, timezone
import argparse
import glob
from pathlib import Path

try:
    import netCDF4 as nc
    import xarray as xr
    HAS_NETCDF = True
except ImportError:
    HAS_NETCDF = False
    print("⚠️  Warning: netCDF4 and xarray not installed. Install with:")
    print("   pip install netCDF4 xarray")

def find_cygnss_files(data_dir):
    """Find all CYGNSS NetCDF files in the data directory"""
    patterns = [
        f"{data_dir}/**/*.nc",
        f"{data_dir}/**/*CYGNSS*.nc", 
        f"{data_dir}/**/*cygnss*.nc"
    ]
    
    files = []
    for pattern in patterns:
        files.extend(glob.glob(pattern, recursive=True))
    
    return sorted(files)

def extract_ddm_from_cygnss(file_path):
    """Extract DDM data from a CYGNSS NetCDF file"""
    try:
        with xr.open_dataset(file_path) as ds:
            # CYGNSS L1 data structure
            # DDM is usually in 'power_analog' or 'ddm_obs' variable
            ddm_vars = ['power_analog', 'ddm_obs', 'ddm_nbrcs', 'power']
            ddm_data = None
            
            for var in ddm_vars:
                if var in ds.variables:
                    ddm_data = ds[var]
                    break
            
            if ddm_data is None:
                print(f"❌ No DDM data found in {file_path}")
                return None
            
            # Get dimensions
            time_vals = ds['ddm_timestamp_utc'].values if 'ddm_timestamp_utc' in ds else ds.dims.get('ddm_obs', [0])
            delay_bins = ds.dims.get('delay', 17)  # CYGNSS typically has 17 delay bins
            doppler_bins = ds.dims.get('doppler', 11)  # and 11 doppler bins
            
            # Select first observation for simplicity
            if len(ddm_data.shape) > 2:
                ddm_sample = ddm_data.isel({list(ddm_data.dims)[0]: 0})
            else:
                ddm_sample = ddm_data
            
            # Convert to numpy array
            ddm_array = ddm_sample.values
            
            # Get delay and doppler coordinates
            if 'delay' in ds.variables:
                delay_coords = ds['delay'].values
            else:
                delay_coords = np.linspace(0, 8, delay_bins)  # chips
                
            if 'doppler' in ds.variables:
                doppler_coords = ds['doppler'].values  
            else:
                doppler_coords = np.linspace(-500, 500, doppler_bins)  # Hz
            
            # Convert to DDM points format
            ddm_points = []
            for i, delay in enumerate(delay_coords):
                for j, doppler in enumerate(doppler_coords):
                    if i < ddm_array.shape[0] and j < ddm_array.shape[1]:
                        power = float(ddm_array[i, j])
                        if not np.isnan(power):
                            ddm_points.append({
                                "delay": float(delay),
                                "doppler": float(doppler), 
                                "power": power
                            })
            
            # Extract metadata
            metadata = {
                "file": os.path.basename(file_path),
                "timestamp": str(time_vals[0]) if len(time_vals) > 0 else datetime.now(timezone.utc).isoformat(),
                "satellite": "CYGNSS",
                "level": "L1",
                "delay_bins": int(delay_bins),
                "doppler_bins": int(doppler_bins),
                "total_points": len(ddm_points)
            }
            
            return {
                "ddm_data": ddm_points,
                "metadata": metadata
            }
            
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return None

def process_cygnss_directory(data_dir, output_file="./public/cygnss_data.json"):
    """Process all CYGNSS files in directory and create JSON output"""
    
    if not HAS_NETCDF:
        print("❌ Cannot process NetCDF files without required libraries")
        return False
    
    print(f"🔍 Searching for CYGNSS files in {data_dir}...")
    cygnss_files = find_cygnss_files(data_dir)
    
    if not cygnss_files:
        print(f"❌ No CYGNSS NetCDF files found in {data_dir}")
        print("Make sure you've downloaded data using:")
        print("podaac-data-downloader -c CYGNSS_L1_V3.0 -d ./data --start-date 2018-08-01T00:00:00Z --end-date 2018-08-08T00:00:00Z -e .nc")
        return False
    
    print(f"✅ Found {len(cygnss_files)} CYGNSS files")
    
    processed_data = []
    
    for i, file_path in enumerate(cygnss_files[:5]):  # Process first 5 files
        print(f"📊 Processing {i+1}/{min(5, len(cygnss_files))}: {os.path.basename(file_path)}")
        
        result = extract_ddm_from_cygnss(file_path)
        if result:
            processed_data.append(result)
    
    if not processed_data:
        print("❌ No valid DDM data extracted from any files")
        return False
    
    # Create output structure for Next.js API
    output_data = {
        "status": "success",
        "data_source": "nasa_cygnss",
        "processed_at": datetime.now(timezone.utc).isoformat(),
        "total_files": len(cygnss_files),
        "processed_files": len(processed_data),
        "sample_ddm": processed_data[0] if processed_data else None,
        "all_ddms": processed_data
    }
    
    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    # Write JSON file
    with open(output_file, 'w') as f:
        json.dump(output_data, f, indent=2)
    
    print(f"✅ Processed data saved to {output_file}")
    print(f"📈 Sample DDM has {len(processed_data[0]['ddm_data'])} data points")
    
    return True

def main():
    parser = argparse.ArgumentParser(description="Process CYGNSS NetCDF data for DDM visualization")
    parser.add_argument("--data-dir", "-d", default="./data", 
                       help="Directory containing downloaded CYGNSS NetCDF files")
    parser.add_argument("--output", "-o", default="./public/cygnss_data.json",
                       help="Output JSON file for Next.js app")
    parser.add_argument("--check", "-c", action="store_true",
                       help="Just check for available files without processing")
    
    args = parser.parse_args()
    
    print("🛰️  CYGNSS Data Processor for DDM Visualization")
    print("=" * 50)
    
    if args.check:
        files = find_cygnss_files(args.data_dir)
        if files:
            print(f"✅ Found {len(files)} CYGNSS files:")
            for f in files[:10]:  # Show first 10
                print(f"   📁 {os.path.basename(f)}")
            if len(files) > 10:
                print(f"   ... and {len(files) - 10} more files")
        else:
            print(f"❌ No CYGNSS files found in {args.data_dir}")
            print("\n💡 To download CYGNSS data, use:")
            print("podaac-data-downloader -c CYGNSS_L1_V3.0 -d ./data --start-date 2018-08-01T00:00:00Z --end-date 2018-08-08T00:00:00Z -e .nc")
        return
    
    success = process_cygnss_directory(args.data_dir, args.output)
    
    if success:
        print("\n🎉 Success! Your Next.js app can now use real CYGNSS data.")
        print(f"   The /api/cygnss endpoint will read from {args.output}")
    else:
        print("\n❌ Processing failed. Check the error messages above.")

if __name__ == "__main__":
    main()
