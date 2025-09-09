#!/usr/bin/env python3
"""
Process Real CYGNSS NetCDF Files
Processes the already downloaded NASA CYGNSS files to extract real DDM data
"""

import os
import json
import numpy as np
from datetime import datetime, timezone
from pathlib import Path

def process_existing_cygnss_files():
    """Process the already downloaded CYGNSS NetCDF files"""
    
    print("🔬 Processing existing CYGNSS NetCDF files...")
    
    data_dir = Path("./data")
    if not data_dir.exists():
        print("❌ Data directory not found. Files may not have been downloaded.")
        return False
    
    # Find NetCDF files
    nc_files = list(data_dir.glob("*.nc"))
    
    if not nc_files:
        print("❌ No NetCDF files found in data directory")
        return False
    
    print(f"✅ Found {len(nc_files)} NetCDF files:")
    for f in nc_files:
        print(f"   📁 {f.name}")
    
    try:
        import netCDF4 as nc
    except ImportError:
        print("❌ NetCDF4 not available. Installing...")
        import subprocess
        import sys
        subprocess.run([sys.executable, "-m", "pip", "install", "netcdf4"], check=True)
        import netCDF4 as nc
    
    processed_data = []
    
    for file_path in nc_files[:1]:  # Process first file
        try:
            print(f"\n📊 Processing: {file_path.name}")
            
            with nc.Dataset(file_path, 'r') as dataset:
                print("📋 Available variables:")
                var_names = list(dataset.variables.keys())
                for var in var_names[:15]:  # Show first 15
                    shape = dataset.variables[var].shape if hasattr(dataset.variables[var], 'shape') else 'scalar'
                    print(f"   • {var}: {shape}")
                
                # Get power data
                if 'power_analog' in dataset.variables:
                    power_data = dataset.variables['power_analog']
                    print(f"✅ Found power_analog data: {power_data.shape}")
                    
                    # CYGNSS data is (time, channels, delay, doppler)
                    # Take first time sample, first channel for simplicity
                    if len(power_data.shape) == 4:
                        # Select a middle time sample with good data
                        time_idx = power_data.shape[0] // 2
                        channel_idx = 0
                        ddm_2d = power_data[time_idx, channel_idx, :, :]
                        print(f"📐 Selected DDM from time {time_idx}, channel {channel_idx}: {ddm_2d.shape}")
                    else:
                        ddm_2d = power_data[0] if len(power_data.shape) > 2 else power_data
                    
                    # Get delay and doppler coordinates
                    delay_coords = None
                    doppler_coords = None
                    
                    if 'delay' in dataset.variables:
                        delay_coords = dataset.variables['delay'][:]
                        print(f"✅ Found delay coordinates: {len(delay_coords)} bins")
                    
                    if 'doppler' in dataset.variables:
                        doppler_coords = dataset.variables['doppler'][:]
                        print(f"✅ Found doppler coordinates: {len(doppler_coords)} bins")
                    
                    # Extract DDM points
                    ddm_points = []
                    rows, cols = ddm_2d.shape
                    
                    print(f"🔬 Extracting {rows}x{cols} DDM data points...")
                    
                    for i in range(rows):
                        for j in range(cols):
                            try:
                                power_val = ddm_2d[i, j]
                                
                                # Skip invalid values
                                if np.isnan(power_val) or np.isinf(power_val) or power_val <= 0:
                                    continue
                                
                                # Use real coordinates if available
                                if delay_coords is not None and i < len(delay_coords):
                                    delay = float(delay_coords[i])
                                else:
                                    delay = i * 0.5  # Default CYGNSS resolution
                                
                                if doppler_coords is not None and j < len(doppler_coords):
                                    doppler = float(doppler_coords[j])
                                else:
                                    doppler = (j - cols//2) * 50  # Default CYGNSS resolution
                                
                                # Convert power to dB if needed
                                if power_val > 100:  # Likely linear scale
                                    power_db = 10 * np.log10(power_val)
                                else:
                                    power_db = float(power_val)
                                
                                ddm_points.append({
                                    "delay": delay,
                                    "doppler": doppler,
                                    "power": power_db
                                })
                                
                            except Exception as e:
                                continue
                    
                    if ddm_points:
                        # Get timestamp
                        timestamp = datetime.now(timezone.utc).isoformat()
                        if 'ddm_timestamp_utc' in dataset.variables:
                            try:
                                time_data = dataset.variables['ddm_timestamp_utc']
                                if time_data.size > 0:
                                    timestamp = str(time_data[time_idx]) if time_idx < time_data.size else str(time_data[0])
                            except:
                                pass
                        
                        metadata = {
                            "file": file_path.name,
                            "timestamp": timestamp,
                            "satellite": f"CYGNSS-{file_path.name[3:5] if len(file_path.name) > 5 else 'XX'}",
                            "level": "L1",
                            "delay_bins": rows,
                            "doppler_bins": cols,
                            "total_points": len(ddm_points),
                            "source": "Real NASA CYGNSS Level 1 data",
                            "processing_note": f"Extracted from time sample {time_idx}, channel {channel_idx}"
                        }
                        
                        processed_data.append({
                            "ddm_data": ddm_points,
                            "metadata": metadata
                        })
                        
                        print(f"✅ Extracted {len(ddm_points)} real DDM points!")
                        break  # Process only one file for now
                    
                else:
                    print("❌ No power_analog variable found")
                    
        except Exception as e:
            print(f"❌ Error processing {file_path.name}: {e}")
            continue
    
    if processed_data:
        # Create final output with REAL NASA data
        cygnss_output = {
            "status": "success",
            "data_source": "nasa_cygnss_real",
            "processed_at": datetime.now(timezone.utc).isoformat(),
            "total_files": len(nc_files),
            "processed_files": len(processed_data),
            "message": "🛰️ REAL NASA CYGNSS satellite data successfully processed!",
            "sample_ddm": processed_data[0] if processed_data else None,
            "all_ddms": processed_data
        }
        
        # Save to public directory for Next.js
        output_path = Path("./public/cygnss_data.json")
        output_path.parent.mkdir(exist_ok=True)
        
        with open(output_path, 'w') as f:
            json.dump(cygnss_output, f, indent=2)
        
        print(f"\n🎉 SUCCESS! Real CYGNSS data saved to: {output_path}")
        print(f"🛰️ Contains {len(processed_data[0]['ddm_data'])} actual satellite measurements!")
        print(f"📡 From satellite: {processed_data[0]['metadata']['satellite']}")
        print(f"📅 Timestamp: {processed_data[0]['metadata']['timestamp']}")
        
        return True
    else:
        print("❌ No data could be processed")
        return False

def main():
    print("🛰️ Real CYGNSS Data Processor")
    print("=" * 35)
    print()
    
    success = process_existing_cygnss_files()
    
    if success:
        print("\n🚀 Your DDM visualization now has REAL NASA satellite data!")
        print("📋 Next steps:")
        print("   1. Start your app: npm run dev")
        print("   2. Go to: http://localhost:3000/delay-doppler-maps") 
        print("   3. Click: '📡 Try Real Data'")
        print("   4. See actual CYGNSS satellite measurements!")
        print()
        print("🌊 You're now viewing real ocean surface reflections from space!")
    else:
        print("\n❌ Processing failed. Check the errors above.")
    
    input("\nPress Enter to exit...")

if __name__ == "__main__":
    main()
