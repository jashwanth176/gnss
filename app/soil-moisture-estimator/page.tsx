"use client"

import { useState, useEffect } from "react"
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

interface WeatherData {
  temperature: number
  humidity: number
  pressure: number
  windSpeed: number
  precipitation: number
  cloudCover: number
}

interface SoilMoistureResult {
  moisturePercent: number
  confidence: number
  classification: string
  gnssrSnr: number
  recommendations: string[]
}

// Simulated AI model for soil moisture estimation
const estimateSoilMoisture = async (
  weatherData: WeatherData,
  location: string,
  gnssrData: { snr: number; elevation: number; surfaceRoughness: number }
): Promise<SoilMoistureResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // AI model simulation based on multiple factors
  const baselineMoisture = weatherData.humidity * 0.4 + weatherData.precipitation * 2
  const temperatureEffect = Math.max(0, 40 - weatherData.temperature) * 0.5
  const gnssrEffect = (gnssrData.snr - 20) * 1.2 + gnssrData.surfaceRoughness * 10
  
  let moisturePercent = Math.min(100, Math.max(0, 
    baselineMoisture + temperatureEffect + gnssrEffect + (Math.random() - 0.5) * 10
  ))
  
  // Adjust for seasonal/regional factors
  if (location.includes('desert') || location.includes('arid')) {
    moisturePercent *= 0.6
  } else if (location.includes('tropical') || location.includes('rainforest')) {
    moisturePercent = Math.min(100, moisturePercent * 1.3)
  }
  
  const confidence = Math.min(95, 70 + (gnssrData.snr - 15) * 2 + Math.random() * 15)
  
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
    gnssrSnr: gnssrData.snr,
    recommendations
  }
}

// Simulated weather API data
const getWeatherData = async (location: string): Promise<WeatherData> => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Simulate realistic weather data for different locations
  const weatherProfiles: Record<string, Partial<WeatherData>> = {
    'New Delhi, India': { temperature: 32, humidity: 65, pressure: 1013, windSpeed: 12, precipitation: 2, cloudCover: 40 },
    'Punjab, India': { temperature: 28, humidity: 70, pressure: 1015, windSpeed: 8, precipitation: 15, cloudCover: 60 },
    'California, USA': { temperature: 24, humidity: 55, pressure: 1018, windSpeed: 15, precipitation: 0, cloudCover: 20 },
    'Queensland, Australia': { temperature: 29, humidity: 75, pressure: 1012, windSpeed: 18, precipitation: 8, cloudCover: 55 },
    'Sahara, Africa': { temperature: 42, humidity: 15, pressure: 1008, windSpeed: 25, precipitation: 0, cloudCover: 5 }
  }
  
  const profile = weatherProfiles[location] || weatherProfiles['New Delhi, India']
  
  return {
    temperature: profile.temperature! + (Math.random() - 0.5) * 6,
    humidity: profile.humidity! + (Math.random() - 0.5) * 20,
    pressure: profile.pressure! + (Math.random() - 0.5) * 10,
    windSpeed: profile.windSpeed! + (Math.random() - 0.5) * 8,
    precipitation: Math.max(0, profile.precipitation! + (Math.random() - 0.5) * 10),
    cloudCover: Math.max(0, Math.min(100, profile.cloudCover! + (Math.random() - 0.5) * 30))
  }
}

export default function SoilMoistureEstimatorPage() {
  const [selectedLocation, setSelectedLocation] = useState("New Delhi, India")
  const [customLocation, setCustomLocation] = useState("")
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [soilResult, setSoilResult] = useState<SoilMoistureResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [weatherLoading, setWeatherLoading] = useState(false)

  const locations = [
    "New Delhi, India",
    "Punjab, India", 
    "California, USA",
    "Queensland, Australia",
    "Sahara, Africa"
  ]

  const loadWeatherData = async (location: string) => {
    setWeatherLoading(true)
    try {
      const data = await getWeatherData(location)
      setWeatherData(data)
    } catch (error) {
      console.error('Failed to load weather data:', error)
    } finally {
      setWeatherLoading(false)
    }
  }

  const runAnalysis = async () => {
    if (!weatherData) return
    
    setIsLoading(true)
    setSoilResult(null)
    
    try {
      // Simulate GNSS-R measurements
      const gnssrData = {
        snr: 20 + Math.random() * 15,
        elevation: 30 + Math.random() * 40,
        surfaceRoughness: Math.random() * 0.1
      }
      
      const result = await estimateSoilMoisture(
        weatherData,
        customLocation || selectedLocation,
        gnssrData
      )
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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gradient-purple">AI Soil Moisture Estimator</h1>
                <p className="text-sm text-muted-foreground">GNSS-R powered precision agriculture</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-500/20 text-green-700">
              AI Powered
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="location">Preset Locations</Label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(location => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="custom">Custom Location</Label>
                  <Input
                    id="custom"
                    placeholder="Enter coordinates or address"
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Weather Conditions */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  {weatherData && (
                    <>
                      {getWeatherIcon(weatherData)({ className: "h-5 w-5 mr-2" })}
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
                  <div className="grid grid-cols-2 gap-4 text-sm">
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
                  AI Analysis
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
                      Run Soil Moisture Analysis
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
          <div className="lg:col-span-2 space-y-6">
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
                      <div className="text-center p-6 rounded-lg glass">
                        <div className={`text-6xl font-bold ${getMoistureColor(soilResult.moisturePercent)}`}>
                          {soilResult.moisturePercent}%
                        </div>
                        <div className="flex items-center justify-center mt-2">
                          {getMoistureIcon(soilResult.classification)({ className: `h-6 w-6 mr-2 ${getMoistureColor(soilResult.moisturePercent)}` })}
                          <span className="text-lg font-semibold">{soilResult.classification}</span>
                        </div>
                      </div>
                    </div>

                    {/* Supporting Metrics */}
                    <div className="md:col-span-2 grid grid-cols-2 gap-4">
                      <Card className="glass-card">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">GNSS-R SNR</p>
                              <p className="text-2xl font-bold">{soilResult.gnssrSnr.toFixed(1)} dB</p>
                            </div>
                            <Satellite className="h-8 w-8 text-blue-500" />
                          </div>
                        </CardContent>
                      </Card>
                      
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
                  <TabsTrigger value="historical">Historical Trends</TabsTrigger>
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
                          <h4 className="font-semibold mb-2">GNSS-R Signal Characteristics</h4>
                          <p className="text-sm text-muted-foreground">
                            The reflected GNSS signals show a SNR of {soilResult.gnssrSnr.toFixed(1)} dB, 
                            indicating {soilResult.classification.toLowerCase()} soil conditions. 
                            Signal coherence and delay-Doppler spreading patterns are consistent with 
                            the estimated moisture levels.
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
                            The AI model achieved {soilResult.confidence}% confidence by 
                            integrating multi-source data including GNSS-R observations, 
                            meteorological parameters, and historical soil patterns.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="historical" className="mt-4">
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle>Historical Trends</CardTitle>
                      <CardDescription>
                        Soil moisture patterns over time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center glass rounded-lg">
                        <div className="text-center">
                          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">Historical chart visualization</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            7-day trend: {soilResult.classification} conditions maintained
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
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
