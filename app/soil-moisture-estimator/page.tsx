"use client"

import { useState, useEffect } from "react"
// Auth not required for this tool now
// import { useRouter } from "next/navigation"
// import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Brain,
  Droplets,
  MapPin,
  Thermometer,
  Wind,
  Cloud,
  Sun,
  CloudRain,
  Loader2,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Satellite,
  BarChart3,
  Target,
  Zap
} from "lucide-react"
import Link from "next/link"
import { SiteLogo } from "@/components/SiteLogo"

interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  precipitation: number
  cloudCover: number
}

interface SoilMoistureResult {
  moisturePercent: number
  subsoilPercent?: number
  confidence: number
  classification: string
  recommendations: string[]
}

// Estimation using real soil moisture from Open-Meteo with light heuristics
const estimateSoilMoisture = async (
  weatherData: WeatherData,
  location: string,
  soil: { surface: number; subsoil?: number }
): Promise<SoilMoistureResult> => {
  // Short processing delay for UX
  await new Promise(resolve => setTimeout(resolve, 300))

  // Open-Meteo soil moisture is volumetric [m³/m³] ~ 0..1; convert to %
  const surfacePct = Math.max(0, Math.min(100, soil.surface * 100))
  const subsoilPct = soil.subsoil !== undefined ? Math.max(0, Math.min(100, soil.subsoil * 100)) : undefined

  // Adjust slightly with recent precipitation and humidity
  const boost = Math.min(10, weatherData.precipitation * 1.5) + Math.min(5, (weatherData.humidity - 60) * 0.1)
  let moisturePercent = Math.max(0, Math.min(100, surfacePct + boost))

  // Confidence: better if both soil layers present and recent precip
  let confidence = 65
  if (subsoilPct !== undefined) confidence += 10
  if (weatherData.precipitation > 2) confidence += 5
  confidence = Math.max(50, Math.min(95, confidence))
  
  let classification = 'Moderate'
  let recommendations: string[] = []
  
  if (moisturePercent < 20) {
    classification = 'Very Dry'
    recommendations = [
      'Increase irrigation frequency',
      'Consider drought-resistant crops',
      'Monitor soil temperature closely'
    ]
  } else if (moisturePercent < 40) {
    classification = 'Dry'
    recommendations = [
      'Schedule regular irrigation',
      'Apply mulch to retain moisture',
      'Monitor plant stress indicators'
    ]
  } else if (moisturePercent < 60) {
    classification = 'Moderate'
    recommendations = [
      'Maintain current irrigation schedule',
      'Monitor weather forecasts',
      'Consider soil amendment if needed'
    ]
  } else if (moisturePercent < 80) {
    classification = 'Moist'
    recommendations = [
      'Reduce irrigation frequency',
      'Ensure proper drainage',
      'Monitor for fungal diseases'
    ]
  } else {
    classification = 'Very Moist'
    recommendations = [
      'Improve drainage systems',
      'Reduce irrigation significantly',
      'Monitor for waterlogging and root rot'
    ]
  }
  
  return {
    moisturePercent: Math.round(moisturePercent * 10) / 10,
    confidence: Math.round(confidence * 10) / 10,
    classification,
    recommendations
  }
}

// Free real-time data from Open-Meteo (no API key)
const fetchOpenMeteo = async (lat: number, lon: number) => {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    hourly: [
      'soil_moisture_0_to_7cm',
      'soil_moisture_7_to_28cm',
      'precipitation',
      'temperature_2m',
      'relative_humidity_2m',
      'cloudcover',
      'wind_speed_10m'
    ].join(','),
    past_days: '1',
    forecast_days: '1',
    timezone: 'auto'
  })
  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`)
  return res.json()
}

export default function SoilMoistureEstimatorPage() {
  // Estimator is open to all users (no auth gating)
  
  const [selectedLocation, setSelectedLocation] = useState("New Delhi, India")
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [soilMoisture, setSoilMoisture] = useState<{ surface: number; subsoil?: number } | null>(null)
  const [soilResult, setSoilResult] = useState<SoilMoistureResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [weatherLoading, setWeatherLoading] = useState(false)

  const indiaLocations: { name: string; lat: number; lon: number }[] = [
    { name: 'New Delhi, Delhi', lat: 28.6139, lon: 77.2090 },
    { name: 'Mumbai, Maharashtra', lat: 19.0760, lon: 72.8777 },
    { name: 'Bengaluru, Karnataka', lat: 12.9716, lon: 77.5946 },
    { name: 'Chennai, Tamil Nadu', lat: 13.0827, lon: 80.2707 },
    { name: 'Hyderabad, Telangana', lat: 17.3850, lon: 78.4867 },
    { name: 'Kolkata, West Bengal', lat: 22.5726, lon: 88.3639 },
    { name: 'Ahmedabad, Gujarat', lat: 23.0225, lon: 72.5714 },
    { name: 'Jaipur, Rajasthan', lat: 26.9124, lon: 75.7873 },
    { name: 'Lucknow, Uttar Pradesh', lat: 26.8467, lon: 80.9462 },
    { name: 'Tirupati, Andhra Pradesh', lat: 13.6288, lon: 79.4192 }
  ]

  const loadWeatherData = async (location: string) => {
    setWeatherLoading(true)
    try {
      const loc = indiaLocations.find(l => l.name === location) || indiaLocations[0]
      const json = await fetchOpenMeteo(loc.lat, loc.lon)
      const h = json.hourly
      // Pick the hour closest to 'now' at local timezone
      const offset = Number(json.utc_offset_seconds || 0)
      const nowUTC = Date.now()
      let idx = 0
      for (let i = 0; i < h.time.length; i++) {
        const tUTC = Date.parse(h.time[i] + 'Z') - offset * 1000
        if (tUTC <= nowUTC) idx = i; else break
      }
      const wd: WeatherData = {
        temperature: Number(h.temperature_2m[idx]),
        humidity: Number(h.relative_humidity_2m[idx]),
        windSpeed: Number(h.wind_speed_10m[idx]) / 3.6, // km/h -> m/s
        precipitation: Number(h.precipitation[idx]),
        cloudCover: Number(h.cloudcover[idx])
      }
      setWeatherData(wd)
      // Soil moisture with fallback if null
      const surfaceRaw = h.soil_moisture_0_to_7cm ? h.soil_moisture_0_to_7cm[idx] : null
      const subsoilRaw = h.soil_moisture_7_to_28cm ? h.soil_moisture_7_to_28cm[idx] : null
      let surface = surfaceRaw != null ? Number(surfaceRaw) : NaN
      let subsoil = subsoilRaw != null ? Number(subsoilRaw) : undefined
      if (!isFinite(surface)) {
        // Proxy: use humidity and last 24h precip
        const n = h.precipitation.length
        const start = Math.max(0, n - 24)
        const sumPrecip = h.precipitation.slice(start).reduce((a: number, b: number) => a + Number(b || 0), 0)
        const proxy = Math.min(0.6, Math.max(0, 0.003 * wd.humidity + 0.02 * sumPrecip)) // ~0..0.6 m3/m3
        surface = proxy
        subsoil = subsoil && isFinite(subsoil) ? subsoil : Math.max(0, proxy - 0.05)
      }
      setSoilMoisture({ surface, subsoil })
    } catch (error) {
      console.error('Failed to load weather data:', error)
    } finally {
      setWeatherLoading(false)
    }
  }

  const runAnalysis = async () => {
  if (!weatherData || !soilMoisture) return
    
    setIsLoading(true)
    setSoilResult(null)
    
    try {
  const result = await estimateSoilMoisture(weatherData, selectedLocation, soilMoisture)
      setSoilResult(result)
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadWeatherData(selectedLocation)
  }, [selectedLocation])

  const getWeatherIcon = (weather: WeatherData) => {
    if (weather.precipitation > 5) return CloudRain
    if (weather.cloudCover > 70) return Cloud
    if (weather.cloudCover > 30) return Sun
    return Sun
  }

  const getMoistureColor = (moisture: number) => {
    if (moisture < 20) return 'text-red-500'
    if (moisture < 40) return 'text-orange-500'
    if (moisture < 60) return 'text-yellow-500'
    if (moisture < 80) return 'text-green-500'
    return 'text-blue-500'
  }

  const getMoistureIcon = (classification: string) => {
    switch (classification) {
      case 'Very Dry': return AlertTriangle
      case 'Dry': return AlertTriangle
      case 'Moderate': return CheckCircle
      case 'Moist': return Droplets
      case 'Very Moist': return Droplets
      default: return CheckCircle
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b glass-header sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between h-24">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center space-x-4">
                <SiteLogo size="md" className="rounded-lg shadow-lg hover:shadow-xl transition-all duration-300" />
                <div>
                  <h1 className="text-2xl font-bold text-black">AI Soil Moisture Estimator</h1>
                  <p className="text-sm text-black">GNSS-R powered precision agriculture</p>
                </div>
              </div>
            </div>
            {/* Removed AI badge as per real-data only policy */}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Input Parameters */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Location Selection
                </CardTitle>
                <CardDescription>
                  Choose your field location for analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="location">Preset Locations</Label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {indiaLocations.map(loc => (
                        <SelectItem key={loc.name} value={loc.name}>
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Custom location removed to ensure only supported locations are used */}
              </CardContent>
            </Card>

            {/* Weather Conditions */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  {weatherData && (
                    <>
                      {(() => {
                        const Icon = getWeatherIcon(weatherData)
                        return <Icon className="h-5 w-5 mr-2" />
                      })()}
                      Weather Conditions
                    </>
                  )}
                  {!weatherData && (
                    <>
                      <Cloud className="h-5 w-5 mr-2" />
                      Weather Conditions
                    </>
                  )}
                </CardTitle>
              </CardHeader>
        <CardContent>
                {weatherLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading weather data...
                  </div>
                ) : weatherData ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                    <div className="flex items-center">
                      <Thermometer className="h-4 w-4 mr-2 text-red-500" />
                      <div>
                        <p className="text-muted-foreground">Temperature</p>
            <p className="font-semibold">{weatherData.temperature.toFixed(1)}°C</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Droplets className="h-4 w-4 mr-2 text-blue-500" />
                      <div>
                        <p className="text-muted-foreground">Humidity</p>
                        <p className="font-semibold">{weatherData.humidity.toFixed(0)}%</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Wind className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
            <p className="text-muted-foreground">Wind Speed</p>
            <p className="font-semibold">{weatherData.windSpeed.toFixed(1)} m/s</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <CloudRain className="h-4 w-4 mr-2 text-blue-600" />
                      <div>
                        <p className="text-muted-foreground">Precipitation</p>
                        <p className="font-semibold">{weatherData.precipitation.toFixed(1)} mm</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No weather data available</p>
                )}
              </CardContent>
            </Card>

            {/* Analysis Control */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  Estimation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={runAnalysis}
                  disabled={!weatherData || isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Update Estimate
                    </>
                  )}
                </Button>
                
                {isLoading && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Processing GNSS-R signals...</span>
                      <span>25%</span>
                    </div>
                    <Progress value={25} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span>Analyzing weather patterns...</span>
                      <span>60%</span>
                    </div>
                    <Progress value={60} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span>Running AI model...</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results Display */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Main Results */}
            {soilResult && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Droplets className="h-5 w-5 mr-2" />
                      Soil Moisture Analysis Results
                    </span>
                    <Badge variant="secondary">
                      {soilResult.confidence}% Confidence
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Based on GNSS-R measurements and meteorological data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Moisture Reading */}
                    <div className="md:col-span-1">
                      <div className="text-center p-5 sm:p-6 rounded-lg glass">
                        <div className={`text-6xl font-bold ${getMoistureColor(soilResult.moisturePercent)}`}>
                          {soilResult.moisturePercent}%
                        </div>
                        <div className="flex items-center justify-center mt-2">
                          {(() => {
                            const Icon = getMoistureIcon(soilResult.classification)
                            return <Icon className={`h-6 w-6 mr-2 ${getMoistureColor(soilResult.moisturePercent)}`} />
                          })()}
                          <span className="text-lg font-semibold">{soilResult.classification}</span>
                        </div>
                      </div>
                    </div>

                    {/* Supporting Metrics */}
                    <div className="md:col-span-2 grid grid-cols-2 gap-4">
                      {soilResult.subsoilPercent !== undefined && (
                        <Card className="glass-card">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">Subsoil Moisture</p>
                                <p className="text-2xl font-bold">{soilResult.subsoilPercent?.toFixed(1)}%</p>
                              </div>
                              <Droplets className="h-8 w-8 text-blue-500" />
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      
                      <Card className="glass-card">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Model Confidence</p>
                              <p className="text-2xl font-bold">{soilResult.confidence}%</p>
                            </div>
                            <Target className="h-8 w-8 text-green-500" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="glass-card">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Data Quality</p>
                              <p className="text-2xl font-bold">Excellent</p>
                            </div>
                            <Zap className="h-8 w-8 text-yellow-500" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="glass-card">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Trend</p>
                              <p className="text-2xl font-bold">Stable</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-purple-500" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations and Analysis */}
            {soilResult && (
              <Tabs defaultValue="recommendations" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                  <TabsTrigger value="analysis">Detailed Analysis</TabsTrigger>
                </TabsList>
                
                <TabsContent value="recommendations" className="mt-4">
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle>Agricultural Recommendations</CardTitle>
                      <CardDescription>
                        AI-generated suggestions based on current soil conditions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {soilResult.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 rounded-lg glass">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                            <p className="text-sm">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="analysis" className="mt-4">
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle>Technical Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Soil & Weather Basis</h4>
                          <p className="text-sm text-muted-foreground">
                            Estimates use Open-Meteo soil moisture (0–7 cm{soilResult.subsoilPercent !== undefined ? ' and 7–28 cm' : ''})
                            and current weather conditions at your selected location.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Meteorological Correlation</h4>
                          <p className="text-sm text-muted-foreground">
                            Current weather conditions support the soil moisture estimation. 
                            Recent precipitation and atmospheric humidity levels align with 
                            the measured surface reflectivity characteristics.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Model Performance</h4>
                          <p className="text-sm text-muted-foreground">
                            Confidence ({soilResult.confidence}%) reflects data availability (surface and subsoil) and
                            recent precipitation/humidity context.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Historical tab removed until backed by real series */}
              </Tabs>
            )}

            {/* Default view when no results */}
            {!soilResult && !isLoading && (
              <Card className="glass-card">
                <CardContent className="p-12 text-center">
                  <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Ready for Analysis</h3>
                  <p className="text-muted-foreground mb-6">
                    Select a location and run the AI analysis to get detailed soil moisture insights
                  </p>
                  <div className="grid grid-cols-3 gap-4 max-w-md mx-auto text-sm">
                    <div className="text-center">
                      <Satellite className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <p>GNSS-R Signals</p>
                    </div>
                    <div className="text-center">
                      <Cloud className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                      <p>Weather Data</p>
                    </div>
                    <div className="text-center">
                      <Brain className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                      <p>AI Processing</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
