#!/usr/bin/env python3
"""
NASA CYGNSS Data Downloader Setup and Download Script
Handles installation and downloads CYGNSS data using official NASA tools
"""

import subprocess
import sys
import os
from pathlib import Path

def install_package(package_name):
    """Install a Python package using pip"""
    try:
        print(f"Installing {package_name}...")
        result = subprocess.run([
            sys.executable, "-m", "pip", "install", "--user", package_name
        ], capture_output=True, text=True, check=True)
        print(f"✅ {package_name} installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install {package_name}")
        print(f"Error: {e.stderr}")
        return False

def check_and_install_dependencies():
    """Check and install required packages"""
    print("🔍 Checking dependencies...")
    
    required_packages = [
        "requests",
        "netcdf4", 
        "xarray",
        "numpy"
    ]
    
    # Try to install NASA downloader tools
    nasa_packages = [
        "podaac-data-subscriber",
        "podaac-data-downloader"
    ]
    
    success = True
    
    # Install basic packages first
    for package in required_packages:
        try:
            __import__(package.replace("-", "_"))
            print(f"✅ {package} already installed")
        except ImportError:
            if not install_package(package):
                success = False
    
    # Try NASA packages
    for package in nasa_packages:
        if not install_package(package):
            print(f"⚠️  {package} installation failed - trying manual download")
    
    return success

def setup_credentials():
    """Check and help setup NASA Earthdata credentials"""
    netrc_path = Path.home() / ".netrc"
    
    if netrc_path.exists():
        print("✅ NASA credentials found")
        return True
    else:
        print("❌ NASA Earthdata credentials not found!")
        print("\n📋 Setup Instructions:")
        print("1. Register at: https://urs.earthdata.nasa.gov/users/new")
        print("2. Create file:", str(netrc_path))
        print("3. Add content:")
        print("   machine urs.earthdata.nasa.gov login YOUR_USERNAME password YOUR_PASSWORD")
        print("\n🔒 Make sure to set file permissions to 600 (read/write for owner only)")
        
        setup_now = input("\nDo you want to set up credentials now? (y/n): ").lower().strip()
        if setup_now == 'y':
            username = input("Enter your NASA Earthdata username: ").strip()
            password = input("Enter your NASA Earthdata password: ").strip()
            
            try:
                with open(netrc_path, 'w') as f:
                    f.write(f"machine urs.earthdata.nasa.gov login {username} password {password}\n")
                
                # Set file permissions (Windows)
                if os.name == 'nt':
                    os.chmod(netrc_path, 0o600)
                
                print("✅ Credentials saved!")
                return True
            except Exception as e:
                print(f"❌ Failed to save credentials: {e}")
                return False
        
        return False

def download_cygnss_data():
    """Download CYGNSS data using NASA tools"""
    data_dir = Path("./data")
    data_dir.mkdir(exist_ok=True)
    
    print(f"📁 Data directory: {data_dir.absolute()}")
    
    # Download commands from user
    commands = [
        {
            "name": "Simple download (all data for date range)",
            "cmd": [
                "podaac-data-downloader", "-c", "CYGNSS_L1_V3.0", "-d", "./data",
                "--start-date", "2018-08-01T00:00:00Z", 
                "--end-date", "2018-08-08T00:00:00Z", "-e", ""
            ]
        },
        {
            "name": "Spatial and temporal search (hurricane belt)",
            "cmd": [
                "podaac-data-downloader", "-c", "CYGNSS_L1_V3.0", "-d", "./data",
                "--start-date", "2018-08-01T00:00:00Z", 
                "--end-date", "2018-08-08T00:00:00Z", 
                "-b", "-180,-40,180,40"
            ]
        },
        {
            "name": "NetCDF files only",
            "cmd": [
                "podaac-data-downloader", "-c", "CYGNSS_L1_V3.0", "-d", "./data",
                "--start-date", "2018-08-01T00:00:00Z", 
                "--end-date", "2018-08-08T00:00:00Z", "-e", ".nc"
            ]
        },
        {
            "name": "Recent data (6 hours)",
            "cmd": [
                "podaac-data-subscriber", "-c", "CYGNSS_L1_V3.0", "-d", "./data", "-m", "360"
            ]
        },
        {
            "name": "Recent data (24 hours)", 
            "cmd": [
                "podaac-data-subscriber", "-c", "CYGNSS_L1_V3.0", "-d", "./data", "-m", "1440"
            ]
        }
    ]
    
    print("\n📡 Available download options:")
    for i, cmd_info in enumerate(commands, 1):
        print(f"{i}. {cmd_info['name']}")
    
    try:
        choice = int(input("\nEnter your choice (1-5): ")) - 1
        if 0 <= choice < len(commands):
            selected = commands[choice]
            print(f"\n🚀 Running: {selected['name']}")
            print(f"Command: {' '.join(selected['cmd'])}")
            
            # Try running the command
            try:
                result = subprocess.run(selected['cmd'], check=True, text=True, capture_output=True)
                print("✅ Download completed successfully!")
                print(result.stdout)
                return True
            except subprocess.CalledProcessError as e:
                print(f"❌ Download failed: {e}")
                print(f"Error output: {e.stderr}")
                
                # Fallback: try with python -m
                print("🔄 Trying alternative method...")
                try:
                    alt_cmd = ["python", "-m"] + selected['cmd']
                    result = subprocess.run(alt_cmd, check=True, text=True, capture_output=True)
                    print("✅ Download completed with alternative method!")
                    return True
                except subprocess.CalledProcessError as e2:
                    print(f"❌ Alternative method also failed: {e2}")
                    return False
            except FileNotFoundError:
                print("❌ NASA downloader command not found!")
                print("This means the installation didn't work properly.")
                print("Try installing manually with: pip install podaac-data-downloader")
                return False
        else:
            print("❌ Invalid choice")
            return False
    except ValueError:
        print("❌ Invalid input")
        return False

def process_downloaded_data():
    """Process downloaded NetCDF files"""
    data_dir = Path("./data")
    nc_files = list(data_dir.glob("**/*.nc"))
    
    if nc_files:
        print(f"✅ Found {len(nc_files)} NetCDF files")
        print("🔄 Processing data for DDM visualization...")
        
        try:
            # Run the processing script
            result = subprocess.run([
                sys.executable, "scripts/process_cygnss_data.py", 
                "-d", "./data", "-o", "./public/cygnss_data.json"
            ], check=True, text=True, capture_output=True)
            
            print("✅ Data processing completed!")
            print("🎉 Your Next.js app can now use real CYGNSS data!")
            print("   Visit: http://localhost:3000/delay-doppler-maps")
            print("   Click: '📡 Try Real Data' button")
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Data processing failed: {e}")
            print("You can try processing manually later.")
            return False
    else:
        print("❌ No NetCDF files found in data directory")
        print("Download may have failed or files were saved elsewhere.")
        return False

def main():
    print("🛰️  NASA CYGNSS Data Downloader Setup")
    print("=" * 50)
    
    # Step 1: Install dependencies
    if not check_and_install_dependencies():
        print("❌ Failed to install some dependencies. You may need to install them manually.")
    
    # Step 2: Setup credentials
    if not setup_credentials():
        print("❌ Credentials setup failed. You'll need to set them up manually.")
        return
    
    # Step 3: Download data
    if download_cygnss_data():
        # Step 4: Process data
        process_downloaded_data()
    else:
        print("❌ Download failed. Check your credentials and try again.")
    
    print("\n" + "=" * 50)
    print("Setup complete! Check the output above for any errors.")
    input("Press Enter to exit...")

if __name__ == "__main__":
    main()
