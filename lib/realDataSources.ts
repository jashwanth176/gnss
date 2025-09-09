// Real GNSS-R Data Integration Guide
// This file shows how to integrate real satellite data

import type { DDMPoint } from '@/app/delay-doppler-maps/page'

/**
 * CYGNSS Data Integration Example
 * 
 * 1. Download CYGNSS L1 data from NASA PO.DAAC
 * 2. Parse NetCDF files containing DDM data
 * 3. Extract delay-doppler correlation surfaces
 */

// Example data structure from CYGNSS NetCDF files
interface CYGNSSData {
  // Time dimension
  sample_time: number[]
  
  // DDM data (samples × delay_bins × doppler_bins)
  power_analog: number[][][]  // Raw DDM power
  power_digital: number[][][] // Processed DDM power
  
  // Geolocation
  sp_lat: number[]            // Specular point latitude
  sp_lon: number[]            // Specular point longitude
  
  // Satellite info
  prn_code: number[]          // GPS satellite PRN
  sv_num: number[]            // CYGNSS satellite number
  
  // Surface conditions
  wind_speed: number[]        // Estimated wind speed
  
  // Delay/Doppler axes
  delay: number[]             // Delay bins (chips)
  doppler: number[]           // Doppler bins (Hz)
}

/**
 * Example API endpoint for real-time CYGNSS data
 * (This would require NASA API key and backend processing)
 */
export async function fetchCYGNSSData(
  startTime: string, 
  endTime: string, 
  boundingBox?: {lat: [number, number], lon: [number, number]}
): Promise<CYGNSSData | null> {
  try {
    // This would connect to NASA's API or your backend
    const response = await fetch('/api/cygnss', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start_time: startTime,
        end_time: endTime,
        bbox: boundingBox
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch CYGNSS data')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching CYGNSS data:', error)
    return null
  }
}

/**
 * Parse real DDM data from CYGNSS format
 */
export function parseCYGNSSToDDM(cygnssData: CYGNSSData, sampleIndex: number): DDMPoint[] {
  const ddmPoints: DDMPoint[] = []
  
  if (!cygnssData.power_analog[sampleIndex]) {
    return ddmPoints
  }
  
  const powerData = cygnssData.power_analog[sampleIndex]
  const delays = cygnssData.delay
  const dopplers = cygnssData.doppler
  
  for (let delayIdx = 0; delayIdx < delays.length; delayIdx++) {
    for (let dopplerIdx = 0; dopplerIdx < dopplers.length; dopplerIdx++) {
      const power = powerData[delayIdx][dopplerIdx]
      
      if (power > 0) { // Filter out invalid data
        ddmPoints.push({
          delay: delays[delayIdx],
          doppler: dopplers[dopplerIdx],
          power: 10 * Math.log10(power) // Convert to dB
        })
      }
    }
  }
  
  return ddmPoints
}

/**
 * Quality control for real DDM data
 */
export function validateDDMData(ddmData: DDMPoint[]): {
  isValid: boolean
  issues: string[]
  stats: {
    peakPower: number
    meanPower: number
    dataPoints: number
  }
} {
  const issues: string[] = []
  
  if (ddmData.length === 0) {
    issues.push('No data points')
    return { isValid: false, issues, stats: { peakPower: 0, meanPower: 0, dataPoints: 0 } }
  }
  
  const powers = ddmData.map(d => d.power)
  const peakPower = Math.max(...powers)
  const meanPower = powers.reduce((sum, p) => sum + p, 0) / powers.length
  
  // Quality checks
  if (peakPower < 10) issues.push('Low signal strength')
  if (meanPower < 0) issues.push('Negative mean power')
  if (ddmData.length < 100) issues.push('Insufficient data points')
  
  const delayRange = Math.max(...ddmData.map(d => d.delay)) - Math.min(...ddmData.map(d => d.delay))
  const dopplerRange = Math.max(...ddmData.map(d => d.doppler)) - Math.min(...ddmData.map(d => d.doppler))
  
  if (delayRange < 1) issues.push('Insufficient delay range')
  if (dopplerRange < 100) issues.push('Insufficient Doppler range')
  
  return {
    isValid: issues.length === 0,
    issues,
    stats: { peakPower, meanPower, dataPoints: ddmData.length }
  }
}

/**
 * Real-time data source configuration
 */
export const DATA_SOURCES = {
  simulation: {
    name: 'Mathematical Simulation',
    description: 'Physics-based GNSS-R models',
    realTime: true,
    cost: 'Free',
    setup: 'None required'
  },
  cygnss: {
    name: 'CYGNSS Mission Data',
    description: 'NASA hurricane monitoring satellites',
    realTime: false, // Usually 6-hour delay
    cost: 'Free with registration',
    setup: 'NASA Earthdata account + API integration',
    url: 'https://podaac.jpl.nasa.gov/',
    coverage: 'Tropical oceans (±38° latitude)'
  },
  gnos: {
    name: 'GNOS-R Data',
    description: 'Chinese GNSS reflectometry',
    realTime: false,
    cost: 'Free with registration',
    setup: 'CAS account + data request',
    coverage: 'Global'
  },
  tds1: {
    name: 'TechDemoSat-1',
    description: 'ESA/UKSA demonstration mission',
    realTime: false,
    cost: 'Free',
    setup: 'ESA account',
    coverage: 'Global',
    note: 'Historical data only (mission ended)'
  }
}

export default {
  fetchCYGNSSData,
  parseCYGNSSToDDM,
  validateDDMData,
  DATA_SOURCES
}
