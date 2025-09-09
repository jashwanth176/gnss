"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Download,
  FileText,
  Database,
  Calendar,
  MapPin,
  HardDrive,
  Eye,
  ExternalLink,
  CheckCircle,
  Satellite,
  Waves,
  BarChart3,
  Globe,
  Filter,
  Search,
  Info,
  Zap
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Dataset {
  id: string
  name: string
  description: string
  type: 'GNSS-R Raw' | 'Processed DDM' | 'Soil Moisture' | 'Ocean Data' | 'Meteorological'
  size: string
  location: string
  dateRange: string
  format: string[]
  sampleRate: string
  parameters: string[]
  downloadUrl: string
  previewUrl?: string
  documentation: string
}

const sampleDatasets: Dataset[] = [
  {
    id: 'cygnss-ocean-2024',
    name: 'CYGNSS Ocean Wind Speed Dataset',
    description: 'High-quality ocean surface wind speed measurements from CYGNSS constellation over the Pacific Ocean',
    type: 'Ocean Data',
    size: '2.3 GB',
    location: 'Pacific Ocean (10°N-40°N, 120°W-180°W)',
    dateRange: 'Jan 2024 - Mar 2024',
    format: ['NetCDF4', 'CSV', 'JSON'],
    sampleRate: '1 Hz',
    parameters: ['Wind Speed', 'Wave Height', 'Surface Roughness', 'SNR', 'Incidence Angle'],
    downloadUrl: '/datasets/cygnss-ocean-2024.zip',
    previewUrl: '/datasets/cygnss-ocean-preview.html',
    documentation: '/docs/cygnss-ocean-dataset.pdf'
  },
  {
    id: 'soil-moisture-india',
    name: 'Indian Agricultural Soil Moisture',
    description: 'Ground-truth validated soil moisture measurements across major agricultural regions in India',
    type: 'Soil Moisture',
    size: '890 MB',
    location: 'Punjab, Haryana, Uttar Pradesh',
    dateRange: 'May 2024 - Aug 2024',
    format: ['HDF5', 'CSV', 'GeoTIFF'],
    sampleRate: '6 hours',
    parameters: ['Volumetric Water Content', 'Temperature', 'Salinity', 'GNSS-R SNR', 'Vegetation Index'],
    downloadUrl: '/datasets/soil-moisture-india.zip',
    previewUrl: '/datasets/soil-moisture-preview.html',
    documentation: '/docs/soil-moisture-dataset.pdf'
  },
  {
    id: 'ddm-raw-australia',
    name: 'Raw Delay-Doppler Maps - Australia',
    description: 'Unprocessed DDM data collected over diverse Australian landscapes including desert, coastal, and agricultural areas',
    type: 'GNSS-R Raw',
    size: '5.7 GB',
    location: 'Continental Australia',
    dateRange: 'Jun 2024 - Sep 2024',
    format: ['Binary', 'MATLAB', 'Python Pickle'],
    sampleRate: '1 Hz',
    parameters: ['Raw DDM Power', 'Satellite Ephemeris', 'Receiver Position', 'Coherent/Incoherent Power'],
    downloadUrl: '/datasets/ddm-raw-australia.zip',
    documentation: '/docs/ddm-raw-dataset.pdf'
  },
  {
    id: 'ice-thickness-arctic',
    name: 'Arctic Sea Ice Thickness Dataset',
    description: 'Sea ice thickness measurements derived from GNSS-R altimetry over the Arctic Ocean',
    type: 'Processed DDM',
    size: '1.2 GB',
    location: 'Arctic Ocean (70°N-85°N)',
    dateRange: 'Dec 2023 - Feb 2024',
    format: ['NetCDF4', 'CSV'],
    sampleRate: '1 measurement per pass',
    parameters: ['Ice Thickness', 'Surface Elevation', 'Reflectivity', 'Coherence Time'],
    downloadUrl: '/datasets/ice-thickness-arctic.zip',
    previewUrl: '/datasets/ice-thickness-preview.html',
    documentation: '/docs/ice-thickness-dataset.pdf'
  },
  {
    id: 'weather-correlation',
    name: 'Multi-Source Weather Correlation Dataset',
    description: 'Synchronized GNSS-R and meteorological station data for algorithm validation and training',
    type: 'Meteorological',
    size: '450 MB',
    location: 'Global (100+ stations)',
    dateRange: 'Mar 2024 - Jun 2024',
    format: ['CSV', 'JSON', 'XML'],
    sampleRate: '15 minutes',
    parameters: ['Temperature', 'Humidity', 'Pressure', 'Wind Speed', 'Precipitation', 'GNSS-R SNR'],
    downloadUrl: '/datasets/weather-correlation.zip',
    previewUrl: '/datasets/weather-correlation-preview.html',
    documentation: '/docs/weather-correlation-dataset.pdf'
  }
]

export default function DownloadDatasetPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!user) {
    return null
  }
  
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([])
  const [filterType, setFilterType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

  const datasetTypes = ['all', 'GNSS-R Raw', 'Processed DDM', 'Soil Moisture', 'Ocean Data', 'Meteorological']

  const filteredDatasets = sampleDatasets.filter(dataset => {
    const typeMatch = filterType === 'all' || dataset.type === filterType
    const searchMatch = searchQuery === '' || 
      dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.location.toLowerCase().includes(searchQuery.toLowerCase())
    return typeMatch && searchMatch
  })

  const handleDatasetSelection = (datasetId: string, checked: boolean) => {
    if (checked) {
      setSelectedDatasets([...selectedDatasets, datasetId])
    } else {
      setSelectedDatasets(selectedDatasets.filter(id => id !== datasetId))
    }
  }

  const calculateTotalSize = () => {
    return selectedDatasets.reduce((total, id) => {
      const dataset = sampleDatasets.find(d => d.id === id)
      if (dataset) {
        const size = parseFloat(dataset.size.split(' ')[0])
        const unit = dataset.size.split(' ')[1]
        return total + (unit === 'GB' ? size * 1024 : size)
      }
      return total
    }, 0)
  }

  const handleDownload = async () => {
    if (selectedDatasets.length === 0) return
    
    setIsDownloading(true)
    setDownloadProgress(0)
    
    // Simulate download progress
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 100))
      setDownloadProgress(i)
    }
    
    // In a real implementation, this would initiate actual downloads
    alert(`Download initiated for ${selectedDatasets.length} dataset(s)`)
    setIsDownloading(false)
    setDownloadProgress(0)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'GNSS-R Raw': return Database
      case 'Processed DDM': return BarChart3
      case 'Soil Moisture': return Waves
      case 'Ocean Data': return Globe
      case 'Meteorological': return Zap
      default: return FileText
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'GNSS-R Raw': return 'bg-blue-500/20 text-blue-700'
      case 'Processed DDM': return 'bg-green-500/20 text-green-700'
      case 'Soil Moisture': return 'bg-yellow-500/20 text-yellow-700'
      case 'Ocean Data': return 'bg-cyan-500/20 text-cyan-700'
      case 'Meteorological': return 'bg-purple-500/20 text-purple-700'
      default: return 'bg-gray-500/20 text-gray-700'
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
                <Image
                  src="/Logo.png"
                  alt="GNSS-R Portal"
                  width={120}
                  height={64}
                  className="rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                />
                <Image
                  src="/IIT_Tirupati_logo.svg"
                  alt="IIT Tirupati"
                  width={80}
                  height={60}
                  className="rounded-md shadow-lg hover:shadow-xl transition-all duration-300"
                />
                <div>
                  <h1 className="text-2xl font-bold text-gradient-cyan">Sample Datasets</h1>
                  <p className="text-sm text-muted-foreground">High-quality GNSS-R research datasets</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {selectedDatasets.length} Selected
              </Badge>
              <Button 
                onClick={handleDownload}
                disabled={selectedDatasets.length === 0 || isDownloading}
                className="bg-gradient-to-r from-primary to-secondary"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Selected
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters and Search */}
        <Card className="glass-card mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search Datasets</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by name, description, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-64">
                <Label htmlFor="filter">Filter by Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {datasetTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type === 'all' ? 'All Types' : type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Download Progress */}
        {isDownloading && (
          <Card className="glass-card mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Preparing Download...</span>
                <span className="text-sm text-muted-foreground">{downloadProgress}%</span>
              </div>
              <Progress value={downloadProgress} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                Compressing {selectedDatasets.length} dataset(s) - Total size: {calculateTotalSize().toFixed(1)} MB
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Dataset List */}
          <div className="lg:col-span-3 space-y-4">
            {filteredDatasets.map(dataset => {
              const IconComponent = getTypeIcon(dataset.type)
              const isSelected = selectedDatasets.includes(dataset.id)
              
              return (
                <Card key={dataset.id} className={`glass-card transition-all duration-200 ${isSelected ? 'ring-2 ring-primary' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleDatasetSelection(dataset.id, checked as boolean)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold">{dataset.name}</h3>
                            <Badge className={getTypeColor(dataset.type)}>
                              <IconComponent className="h-3 w-3 mr-1" />
                              {dataset.type}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-3">{dataset.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center">
                              <HardDrive className="h-4 w-4 mr-2 text-blue-500" />
                              <div>
                                <p className="text-muted-foreground">Size</p>
                                <p className="font-semibold">{dataset.size}</p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-green-500" />
                              <div>
                                <p className="text-muted-foreground">Location</p>
                                <p className="font-semibold text-xs">{dataset.location}</p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                              <div>
                                <p className="text-muted-foreground">Date Range</p>
                                <p className="font-semibold text-xs">{dataset.dateRange}</p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <BarChart3 className="h-4 w-4 mr-2 text-orange-500" />
                              <div>
                                <p className="text-muted-foreground">Sample Rate</p>
                                <p className="font-semibold">{dataset.sampleRate}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {dataset.previewUrl && (
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-1" />
                          Docs
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium mb-1">Available Formats:</p>
                        <div className="flex space-x-2">
                          {dataset.format.map(format => (
                            <Badge key={format} variant="outline" className="text-xs">
                              {format}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-1">Parameters:</p>
                        <div className="flex flex-wrap gap-1">
                          {dataset.parameters.slice(0, 4).map(param => (
                            <Badge key={param} variant="secondary" className="text-xs">
                              {param}
                            </Badge>
                          ))}
                          {dataset.parameters.length > 4 && (
                            <Badge variant="secondary" className="text-xs">
                              +{dataset.parameters.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Download Summary */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="h-5 w-5 mr-2" />
                  Download Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Selected datasets:</span>
                    <span className="font-semibold">{selectedDatasets.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total size:</span>
                    <span className="font-semibold">{calculateTotalSize().toFixed(1)} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Estimated time:</span>
                    <span className="font-semibold">{Math.ceil(calculateTotalSize() / 100)} min</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dataset Statistics */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Dataset Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Total datasets:</span>
                    <span className="font-semibold">{sampleDatasets.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Raw data:</span>
                    <span className="font-semibold">{sampleDatasets.filter(d => d.type === 'GNSS-R Raw').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processed data:</span>
                    <span className="font-semibold">{sampleDatasets.filter(d => d.type === 'Processed DDM').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ocean data:</span>
                    <span className="font-semibold">{sampleDatasets.filter(d => d.type === 'Ocean Data').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Information */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  Usage Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <p>Free for research and educational use</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <p>Comprehensive documentation included</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <p>Multiple format options available</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                    <p>Commercial use requires license</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
