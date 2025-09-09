"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Download,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Info,
  Satellite,
  Map,
  BarChart3
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"

// Import Canvas component dynamically with proper loading
const DDMCanvas = dynamic(() => import("@/components/DDMCanvasSimple"), { 
  ssr: false,
  loading: () => (
    <div className="w-[600px] h-[400px] bg-slate-800 rounded flex items-center justify-center">
      <div className="text-white/70">Loading visualization...</div>
    </div>
  )
})

export interface DDMPoint {
  delay: number
  doppler: number
  power: number
}

// Generate realistic DDM data based on surface type and conditions
const generateDDMData = (snr: number, windSpeed: number, surfaceType: string, timeIndex: number): DDMPoint[] => {
  const data: DDMPoint[] = []
  const delayBins = 64
  const dopplerBins = 64
  const maxDelay = 8 // chips
  const maxDoppler = 500 // Hz
  
  // Time variation for animation
  const timePhase = (timeIndex * 0.1) % (2 * Math.PI)
  const timeFactor = Math.sin(timePhase) * 0.3 + 1
  
  for (let i = 0; i < delayBins; i++) {
    for (let j = 0; j < dopplerBins; j++) {
      const delay = (i / delayBins) * maxDelay
      const doppler = ((j - dopplerBins/2) / dopplerBins) * maxDoppler
      
      // Normalized coordinates
      const delayNorm = (delay - 2) / 1.5
      const dopplerNorm = doppler / 100
      
      // Main reflection peak
      let mainPeak = Math.exp(-(delayNorm * delayNorm + dopplerNorm * dopplerNorm) / 2) * snr * timeFactor
      
      // Surface-specific scattering
      let scattering = 0
      if (surfaceType === 'ocean') {
        const windFactor = Math.min(windSpeed / 15, 1)
        scattering = windFactor * 8 * Math.exp(-(delayNorm * delayNorm) / 4) * 
                    Math.exp(-(dopplerNorm * dopplerNorm) / (2 + windFactor)) * 
                    (Math.random() * 0.8 + 0.2)
      } else if (surfaceType === 'land') {
        scattering = Math.random() * snr * 0.15 * Math.exp(-Math.abs(delayNorm) / 2)
      } else if (surfaceType === 'ice') {
        mainPeak *= 1.3
        scattering = Math.random() * snr * 0.05
      } else if (surfaceType === 'coastal') {
        scattering = (Math.random() * snr * 0.2 + windSpeed * 0.5) * 
                    Math.exp(-(delayNorm * delayNorm) / 3)
      }
      
      // Noise floor
      const noise = Math.random() * 1.5 + 0.5
      const totalPower = Math.max(noise, mainPeak + scattering)
      
      data.push({ delay, doppler, power: totalPower })
    }
  }
  
  return data
}

export default function DelayDopplerMapsPage() {
  const [ddmData, setDdmData] = useState<DDMPoint[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [snr, setSnr] = useState([25])
  const [windSpeed, setWindSpeed] = useState([8])
  const [surfaceType, setSurfaceType] = useState("ocean")
  const [dataSource, setDataSource] = useState<'simulation' | 'cygnss_real'>('simulation')
  const [realDataStatus, setRealDataStatus] = useState<string>('')
  
  // Generate initial data
  useEffect(() => {
    const initialData = generateDDMData(snr[0], windSpeed[0], surfaceType, 0)
    setDdmData(initialData)
  }, [snr, windSpeed, surfaceType])
  
  // Animation loop
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1
          const newData = generateDDMData(snr[0], windSpeed[0], surfaceType, newTime)
          setDdmData(newData)
          return newTime
        })
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isPlaying, snr, windSpeed, surfaceType])
  
  // Update data when parameters change
  useEffect(() => {
    const newData = generateDDMData(snr[0], windSpeed[0], surfaceType, currentTime)
    setDdmData(newData)
  }, [snr, windSpeed, surfaceType, currentTime])
  
  const handlePlay = () => setIsPlaying(!isPlaying)
  const handleReset = () => {
    setIsPlaying(false)
    setCurrentTime(0)
    const resetData = generateDDMData(snr[0], windSpeed[0], surfaceType, 0)
    setDdmData(resetData)
  }
  
  const exportData = () => {
    const csv = [
      'Delay (chips),Doppler (Hz),Power (dB)',
      ...ddmData.map(d => `${d.delay.toFixed(3)},${d.doppler.toFixed(1)},${d.power.toFixed(2)}`)
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ddm-${dataSource}-${Date.now()}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Real CYGNSS data functions
  const fetchRealCYGNSSData = async () => {
    setRealDataStatus('🛰️ Loading real CYGNSS satellite data...')
    try {
      const response = await fetch('/api/cygnss')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.sample_ddm && result.sample_ddm.ddm_data) {
        // Use the real CYGNSS data directly 
        setDdmData(result.sample_ddm.ddm_data)
        setDataSource('cygnss_real')
        setIsPlaying(false) // Stop animation for real data
        setRealDataStatus(`✅ Loaded real CYGNSS data (${result.sample_ddm.metadata.timestamp})`)
      } else {
        setRealDataStatus('❌ No CYGNSS data available. See setup guide.')
      }
    } catch (error) {
      setRealDataStatus(`❌ Failed to load real data: ${error}`)
    }
  }

  const switchToSimulation = () => {
    setDataSource('simulation')
    setRealDataStatus('')
    const resetData = generateDDMData(snr[0], windSpeed[0], surfaceType, 0)
    setDdmData(resetData)
  }

  // Statistics
  const maxPower = ddmData.length > 0 ? Math.max(...ddmData.map(d => d.power)) : 0
  const meanPower = ddmData.length > 0 ? ddmData.reduce((sum, d) => sum + d.power, 0) / ddmData.length : 0
  const peakLocation = ddmData.length > 0 ? ddmData.reduce((max, d) => d.power > max.power ? d : max, ddmData[0]) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] opacity-5"></div>
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <Image
                  src="/Logo.png"
                  alt="GNSS-R Portal"
                  width={28}
                  height={28}
                  className="rounded-lg"
                />
                <Image
                  src="/IIT_Tirupati_logo.svg"
                  alt="IIT Tirupati"
                  width={24}
                  height={24}
                  className="rounded"
                />
                <Satellite className="w-6 h-6 text-blue-400" />
                <h1 className="text-2xl font-bold text-white">Real-time Delay-Doppler Maps</h1>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-600/20 text-blue-300 border-blue-500/30">
              {isPlaying ? 'LIVE' : 'PAUSED'}
            </Badge>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Visualization Panel */}
            <div className="lg:col-span-3">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Map className="w-5 h-5 text-green-400" />
                        DDM Correlation Surface
                      </CardTitle>
                      <CardDescription className="text-white/60">
                        GNSS-R delay-doppler correlation for {surfaceType} surface
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handlePlay}
                        size="sm"
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        {isPlaying ? 'Pause' : 'Start'}
                      </Button>
                      <Button
                        onClick={handleReset}
                        size="sm"
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={exportData}
                        size="sm"
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Data Source Control */}
                    <div className={`border rounded-lg p-3 ${
                      dataSource === 'simulation' 
                        ? 'bg-blue-500/10 border-blue-500/30' 
                        : 'bg-green-500/10 border-green-500/30'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Info className="w-4 h-4" />
                          <span className="font-medium text-sm">
                            {dataSource === 'simulation' ? '🎯 Simulated Data' : '🛰️ Real CYGNSS Data'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {dataSource === 'simulation' ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="h-6 text-xs border-green-500/40 text-green-300 hover:bg-green-500/10"
                              onClick={fetchRealCYGNSSData}
                            >
                              📡 Try Real Data
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="h-6 text-xs border-blue-500/40 text-blue-300 hover:bg-blue-500/10"
                              onClick={switchToSimulation}
                            >
                              🎯 Back to Simulation
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-xs text-white/70">
                        {dataSource === 'simulation' 
                          ? 'Physics-based GNSS-R models that replicate real satellite behavior'
                          : 'Actual NASA CYGNSS satellite measurements from hurricane monitoring'
                        }
                      </p>
                      
                      {realDataStatus && (
                        <div className="mt-2 text-xs text-white/80 bg-black/20 p-2 rounded">
                          {realDataStatus}
                        </div>
                      )}
                    </div>

                    {/* Canvas Container with proper framing */}
                    <div className="bg-black/40 rounded-lg border border-white/10 overflow-hidden">
                      <div className="relative">
                        {/* Canvas with responsive sizing */}
                        <div className="flex justify-center p-6">
                          <div className="relative">
                            <DDMCanvas data={ddmData} width={600} height={400} />
                            
                            {/* Axis Labels */}
                            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-white/70 text-sm font-medium">
                              Delay (chips)
                            </div>
                            <div className="absolute -left-12 top-1/2 transform -translate-y-1/2 -rotate-90 text-white/70 text-sm font-medium">
                              Doppler Frequency (Hz)
                            </div>
                            
                            {/* Color Scale */}
                            <div className="absolute top-4 -right-16 bg-black/70 p-3 rounded border border-white/20">
                              <div className="text-white/80 text-xs mb-2 text-center">Power</div>
                              <div className="w-6 h-32 bg-gradient-to-t from-blue-600 via-cyan-400 via-green-400 via-yellow-400 to-red-500 rounded border border-white/20"></div>
                              <div className="text-white/60 text-xs mt-2 space-y-1">
                                <div className="text-center">{maxPower.toFixed(0)} dB</div>
                                <div className="text-center mt-6">{(maxPower * 0.5).toFixed(0)}</div>
                                <div className="text-center mt-6">0 dB</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Grid Scale References */}
                        <div className="absolute bottom-2 left-6 text-xs text-white/50 font-mono">
                          0 chips
                        </div>
                        <div className="absolute bottom-2 right-20 text-xs text-white/50 font-mono">
                          8 chips
                        </div>
                        <div className="absolute top-4 left-2 text-xs text-white/50 font-mono">
                          +250Hz
                        </div>
                        <div className="absolute bottom-16 left-2 text-xs text-white/50 font-mono">
                          -250Hz
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div className="bg-white/5 p-3 rounded border border-white/10">
                        <div className="text-white/60">Time</div>
                        <div className="text-white font-mono">{currentTime.toFixed(1)}s</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded border border-white/10">
                        <div className="text-white/60">Data Points</div>
                        <div className="text-white font-mono">{ddmData.length.toLocaleString()}</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded border border-white/10">
                        <div className="text-white/60">Peak Power</div>
                        <div className="text-white font-mono">{maxPower.toFixed(1)} dB</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded border border-white/10">
                        <div className="text-white/60">Status</div>
                        <div className="text-white">{isPlaying ? 'Recording' : 'Paused'}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Control Panel */}
            <div className="space-y-6">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-orange-400" />
                    Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">
                      SNR: {snr[0]} dB
                    </label>
                    <Slider
                      value={snr}
                      onValueChange={setSnr}
                      min={10}
                      max={45}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">
                      Wind Speed: {windSpeed[0]} m/s
                    </label>
                    <Slider
                      value={windSpeed}
                      onValueChange={setWindSpeed}
                      min={0}
                      max={25}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">
                      Surface Type
                    </label>
                    <Select value={surfaceType} onValueChange={setSurfaceType}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ocean">Ocean Surface</SelectItem>
                        <SelectItem value="land">Land Surface</SelectItem>
                        <SelectItem value="ice">Sea Ice</SelectItem>
                        <SelectItem value="coastal">Coastal Area</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    Live Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Peak Power:</span>
                      <span className="text-white font-mono">{maxPower.toFixed(1)} dB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Mean Power:</span>
                      <span className="text-white font-mono">{meanPower.toFixed(1)} dB</span>
                    </div>
                    {peakLocation && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Peak Delay:</span>
                          <span className="text-white font-mono">{peakLocation.delay.toFixed(2)} chips</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Peak Doppler:</span>
                          <span className="text-white font-mono">{peakLocation.doppler.toFixed(1)} Hz</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Satellite className="w-5 h-5 text-blue-400" />
                    Data Source & Accuracy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded p-3">
                    <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-1">
                      <Info className="w-4 h-4" />
                      Simulated Data
                    </div>
                    <p className="text-amber-200/80 text-xs mb-2">
                      Currently using mathematical models that replicate real GNSS-R physics. 
                      This is NOT live satellite data.
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-7 text-xs border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
                      onClick={() => window.open('/api/cygnss', '_blank')}
                    >
                      View Real Data Sources →
                    </Button>
                  </div>
                  
                  <div>
                    <h4 className="text-white/90 font-medium text-sm mb-2">📡 FREE Real Data Sources:</h4>
                    <div className="space-y-2 text-xs">
                      <div className="bg-white/5 p-2 rounded border border-white/10">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-green-400 font-medium">NASA CYGNSS</span>
                          <span className="text-green-300 text-xs">FREE</span>
                        </div>
                        <p className="text-white/70 mb-1">Hurricane monitoring satellites with DDM data</p>
                        <div className="text-white/60 space-y-1">
                          <div>• Registration: nasa.gov/earthdata</div>
                          <div>• Coverage: Tropical oceans (±38°)</div>
                          <div>• Format: NetCDF (.nc files)</div>
                          <div>• Delay: 3-6 hours from real-time</div>
                        </div>
                      </div>
                      
                      <div className="bg-white/5 p-2 rounded border border-white/10">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-blue-400 font-medium">ESA TechDemoSat-1</span>
                          <span className="text-green-300 text-xs">FREE</span>
                        </div>
                        <p className="text-white/70 mb-1">First European GNSS-R mission data</p>
                        <div className="text-white/60 space-y-1">
                          <div>• Registration: esa.int/earthnet</div>
                          <div>• Coverage: Global (historical)</div>
                          <div>• Format: NetCDF files</div>
                        </div>
                      </div>
                      
                      <div className="bg-white/5 p-2 rounded border border-white/10">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-red-400 font-medium">GNOS-R (China)</span>
                          <span className="text-green-300 text-xs">FREE</span>
                        </div>
                        <p className="text-white/70 mb-1">Chinese academy GNSS reflectometry</p>
                        <div className="text-white/60 space-y-1">
                          <div>• Registration: gnos.ac.cn</div>
                          <div>• Coverage: Global land/ocean</div>
                          <div>• Format: HDF5/NetCDF</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-white/10">
                    <h4 className="text-white/90 font-medium text-sm mb-1">Current Simulation:</h4>
                    <div className="text-xs text-white/60 space-y-1">
                      <div>• Physics-based scattering models</div>
                      <div>• Realistic surface roughness effects</div>
                      <div>• Proper GNSS-R correlation patterns</div>
                      <div>• 64×64 bin resolution, ±250Hz Doppler</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Info className="w-5 h-5 text-cyan-400" />
                    GNSS-R Science
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-white/70 leading-relaxed space-y-3">
                    <p>
                      Delay-Doppler Maps visualize GPS signal reflections from Earth's surface. 
                      The bright central peak represents the specular reflection point.
                    </p>
                    <p>
                      <strong className="text-white/90">Ocean:</strong> Shows characteristic patterns due to wave motion.
                    </p>
                    <p>
                      <strong className="text-white/90">Land:</strong> More diffuse scattering with lower coherence.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
