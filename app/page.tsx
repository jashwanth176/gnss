"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Satellite,
  Map,
  BarChart3,
  Search,
  TrendingUp,
  Brain,
  Download,
  Waves,
  Sprout,
  Snowflake,
  Navigation,
  ArrowRight,
  Github,
  Mail,
  BookOpen,
  Settings,
  Calendar,
  ExternalLink,
  Menu,
  X,
  ChevronDown,
  Play,
  Zap,
  Target,
  Database,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthModal } from "@/components/AuthModal"
import { UserMenu } from "@/components/UserMenu"
import { useAuth } from "@/contexts/AuthContext"
import dynamic from 'next/dynamic';
import Link from "next/link"
import { fetchLatestUpdates } from "@/lib/fetchArxivUpdates"

const SatelliteMap = dynamic(() => import("@/components/SatelliteMap"), { ssr: false });

export default function HomePage() {
  const { user, loading } = useAuth()
  const [activeStep, setActiveStep] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const heroRef = useRef<HTMLElement>(null)
  const featuresRef = useRef<HTMLElement>(null)
  const mapRef = useRef<HTMLElement>(null)
  const useCasesRef = useRef<HTMLElement>(null)
  const howItWorksRef = useRef<HTMLElement>(null)
  const updatesRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Remote placeholder generator (picsum) for steps and fallbacks
  const ph = (w: number, h: number, seed?: string) =>
    `https://picsum.photos/${w}/${h}${seed ? `?random=${encodeURIComponent(seed)}` : ''}`

  const [updates, setUpdates] = useState<Awaited<ReturnType<typeof fetchLatestUpdates>>>([])
  const [updatesLoading, setUpdatesLoading] = useState(true)

  // Navigation handler
  const scrollToSection = (sectionName: string) => {
    const refs = {
      'Home': heroRef,
      'Data Portal': mapRef,
      'Live Visualization': featuresRef,
      'Documentation': howItWorksRef,
      'Contact': updatesRef
    }
    const ref = refs[sectionName as keyof typeof refs]
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' })
    }
    setMobileMenuOpen(false)
  }

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const steps = [
    {
      title: "Satellite emits GNSS signal",
      icon: Satellite,
      description: "GNSS satellites transmit navigation signals containing timing and orbital information",
    },
    {
      title: "Signal reflects off Earth's surface",
      icon: Waves,
      description: "Signals bounce off various surfaces including land, ocean, ice, and vegetation",
    },
    {
      title: "Receiver captures reflected signal",
      icon: Navigation,
      description: "Ground-based or spaceborne receivers detect both direct and reflected signals",
    },
    {
      title: "DDM generated and analyzed",
      icon: BarChart3,
      description: "Delay-Doppler Maps are created from the correlation of received signals",
    },
    {
      title: "ML algorithms retrieve parameters",
      icon: Brain,
      description: "Advanced AI models extract geophysical parameters from the processed data",
    },
  ]

  const features = [
    {
      icon: Satellite,
      title: "Multi-Constellation Support",
      description:
        "GPS, Galileo, GLONASS, and BeiDou satellite data integration with real-time processing capabilities",
      color: "text-blue-500",
    },
    {
      icon: Map,
      title: "Advanced Visualizations",
      description: "Interactive Delay-Doppler Maps, SNR plots, and comprehensive altimetry visualization tools",
      color: "text-green-500",
    },
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description:
        "State-of-the-art machine learning models for soil moisture, ocean roughness, and ice thickness estimation",
      color: "text-purple-500",
    },
    {
      icon: Database,
      title: "Open Research Platform",
      description: "Comprehensive open-access datasets and APIs for global research collaboration and development",
      color: "text-orange-500",
    },
  ]

  const useCases = [
    {
      id: "ocean",
      title: "Ocean Altimetry",
      icon: Waves,
      color: "blue",
      description:
        "Monitor sea surface height variations, ocean currents, and wave characteristics using advanced GNSS-R measurements from both spaceborne and coastal receiver networks.",
      features: [
        "Sea surface height monitoring",
        "Wave height estimation",
        "Ocean current analysis",
        "Coastal zone studies",
      ],
      image: "/1.png?height=300&width=400",
    },
    {
      id: "soil",
      title: "Soil Moisture Estimation",
      icon: Sprout,
      color: "green",
      description:
        "Retrieve high-resolution soil moisture content across agricultural and natural landscapes using AI-powered analysis of GNSS-R signal characteristics.",
      features: ["Agricultural monitoring", "Drought assessment", "Irrigation optimization", "Climate research"],
      image: "/2.png?height=300&width=400",
    },
    {
      id: "cryo",
      title: "Cryosphere Monitoring",
      icon: Snowflake,
      color: "cyan",
      description:
        "Track ice thickness variations, snow depth measurements, and permafrost changes in polar regions using specialized GNSS-R processing techniques.",
      features: ["Ice thickness mapping", "Snow depth analysis", "Permafrost monitoring", "Climate change studies"],
      image: "/3.png?height=300&width=400",
    },
    {
      id: "orbit",
      title: "Satellite Calibration",
      icon: Target,
      color: "purple",
      description:
        "Enhance satellite positioning accuracy and validate orbital parameters using ground-truth GNSS-R measurements and advanced calibration algorithms.",
      features: ["Orbit determination", "Clock synchronization", "Atmospheric corrections", "Precision positioning"],
      image: "/4.png?height=300&width=400",
    },
  ]

  useEffect(() => {
    let mounted = true
    setUpdatesLoading(true)
    fetchLatestUpdates()
      .then((data) => {
        if (mounted) {
          setUpdates(data)
          setUpdatesLoading(false)
        }
      })
      .catch((error) => {
        console.error('Error fetching updates:', error)
        if (mounted) {
          setUpdatesLoading(false)
        }
      })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full glass-header transition-all duration-300">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center space-x-2">
              <div className="relative">
                <Satellite className="h-8 w-8 text-primary animate-float glow-cyan" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary/30 rounded-full animate-ping"></div>
              </div>
              <Waves className="h-6 w-6 text-secondary animate-float glow-purple" style={{ animationDelay: "0.5s" }} />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold text-gradient-cyan animate-text-shimmer">
                GNSS-R Tool
              </span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center space-x-8">
            {["Home", "Data Portal", "Live Visualization", "Documentation", "Contact"].map((item, index) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className="text-sm font-medium hover:text-primary transition-all duration-300 relative group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary transition-all duration-300 group-hover:w-full"></span>
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="hidden sm:flex items-center space-x-2">
              {loading ? (
                <div className="h-8 w-20 animate-pulse bg-muted rounded" />
              ) : user ? (
                <UserMenu />
              ) : (
                <>
                  <AuthModal defaultTab="signin">
                    <Button variant="outline" size="sm" className="glass hover:scale-105 transition-all duration-300 border-primary/20 hover:border-primary/40">
                      Login
                    </Button>
                  </AuthModal>
                  <AuthModal defaultTab="signup">
                    <Button
                      size="sm"
                      className="hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary to-secondary glow-cyan"
                    >
                      Sign Up
                    </Button>
                  </AuthModal>
                </>
              )}
            </div>
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 glass">
            <div className="container py-4 space-y-4">
              {["Home", "Data Portal", "Live Visualization", "Documentation", "Contact"].map((item) => (
                <button 
                  key={item} 
                  onClick={() => scrollToSection(item)}
                  className="block text-sm font-medium hover:text-primary transition-colors w-full text-left"
                >
                  {item}
                </button>
              ))}
              <div className="flex space-x-2 pt-2">
                {loading ? (
                  <div className="flex space-x-2 w-full">
                    <div className="h-9 flex-1 animate-pulse bg-muted rounded" />
                    <div className="h-9 flex-1 animate-pulse bg-muted rounded" />
                  </div>
                ) : user ? (
                  <div className="flex items-center space-x-2 pt-2">
                    <UserMenu />
                  </div>
                ) : (
                  <>
                    <AuthModal defaultTab="signin">
                      <Button variant="outline" size="sm" className="flex-1 glass border-primary/20">
                        Login
                      </Button>
                    </AuthModal>
                    <AuthModal defaultTab="signup">
                      <Button size="sm" className="flex-1 bg-gradient-to-r from-primary to-secondary">
                        Sign Up
                      </Button>
                    </AuthModal>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section with Parallax */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      >
        {/* Video Background */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-sm"
          src="/854518-hd_1920_1080_30fps.mp4"
        />

        {/* Enhanced Parallax Background Elements */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        >
          <div className="absolute top-20 left-10 w-2 h-2 bg-primary rounded-full animate-pulse-slow glow-cyan"></div>
          <div
            className="absolute top-40 right-20 w-3 h-3 bg-secondary rounded-full animate-pulse-slow glow-purple"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-40 left-1/4 w-1 h-1 bg-primary rounded-full animate-pulse-slow glow-cyan"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute bottom-60 right-1/3 w-2 h-2 bg-secondary rounded-full animate-pulse-slow glow-purple"
            style={{ animationDelay: "0.5s" }}
          ></div>
          {/* Additional floating elements */}
          <div className="absolute top-1/3 left-1/2 w-4 h-4 border border-primary/30 rounded-full animate-float"></div>
          <div className="absolute top-2/3 left-1/4 w-6 h-6 border border-secondary/20 rounded-full animate-float" style={{ animationDelay: "1.5s" }}></div>
        </div>

        {/* Glass overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-transparent to-background/30"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="space-y-6 animate-slide-up">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="text-gradient-cyan animate-gradient">
                  Global Navigation Satellite System
                </span>
                <br />
                <span
                  className="text-gradient-purple animate-gradient"
                  style={{ animationDelay: "0.5s" }}
                >
                  Reflectometry Tool
                </span>
              </h1>

              <p
                className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in-up"
                style={{ animationDelay: "0.3s" }}
              >
                A Web Interface for GNSS-R Data Visualization, Analysis, and Access
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
              <Button
                size="lg"
                className="group hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary to-secondary glow-cyan"
              >
                <Search className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                Explore Live Data
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="group hover:scale-105 transition-all duration-300 glass border-primary/30 hover:border-primary/50"
                asChild
              >
                <Link href="/delay-doppler-maps">
                  <TrendingUp className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  View Delay-Doppler Maps
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="group hover:scale-105 transition-all duration-300 glass border-secondary/30 hover:border-secondary/50"
                asChild
              >
                <Link href="/soil-moisture-estimator">
                  <Brain className="h-5 w-5 mr-2 group-hover:pulse transition-all" />
                  Try AI Soil Moisture Estimator
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="group hover:scale-105 transition-all duration-300 glass border-accent/30 hover:border-accent/50"
                asChild
              >
                <Link href="/download-datasets">
                  <Download className="h-5 w-5 mr-2 group-hover:bounce transition-all" />
                  Download Sample Dataset
                </Link>
              </Button>
            </div>

            <div
              className="max-w-4xl mx-auto animate-fade-in-up"
              style={{
                animationDelay: "0.9s",
                transform: `translateY(${scrollY * 0.2}px)`,
              }}
            > 
            </div>
          </div>
        </div>

        {/* Enhanced Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-float">
          <div 
            className="glass rounded-full p-2 glow-cyan cursor-pointer hover:scale-110 transition-all duration-300"
            onClick={() => featuresRef.current?.scrollIntoView({ behavior: 'smooth' })}
          >
            <ChevronDown className="h-6 w-6 text-primary animate-bounce" />
          </div>
        </div>
      </section>
     
      {/* Key Features Section */}
      <section ref={featuresRef} className="py-24 px-4 relative">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient-cyan">
              Key Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Cutting-edge technology for comprehensive GNSS-R data analysis and visualization
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card
                  key={index}
                  className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 glass-card hover:glow-cyan animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="relative mx-auto mb-4">
                      <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center group-hover:scale-110 transition-transform duration-300 glow-cyan">
                        <Icon className={`h-8 w-8 ${feature.color} group-hover:rotate-12 transition-transform duration-300`} />
                      </div>
                      <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center leading-relaxed">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Interactive Map Preview */}
      <section ref={mapRef} className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5"></div>
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient-purple">
              Live Global Data Preview
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore real-time GNSS-R observations from around the world
            </p>
          </div>

          <Card className="max-w-6xl mx-auto group hover:shadow-2xl transition-all duration-500 glass-card glow-purple animate-fade-in-up">
            <CardContent className="p-8">
              <div className="relative overflow-hidden rounded-xl glass">
                {/* Interactive Preview Options */}
                <div className="mb-6">
                  <Tabs defaultValue="external" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="external">GNSS-R Portal</TabsTrigger>
                      <TabsTrigger value="weather">Weather & Ocean Data</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="external" className="mt-6">
                      <div className="relative bg-muted rounded-xl overflow-hidden" style={{ height: '500px' }}>
                        <iframe
                          src="https://iittnif-map.vercel.app/"
                          className="w-full h-full border-0"
                          title="Interactive GNSS-R Map"
                          loading="lazy"
                        />
                        <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg p-2">
                          <p className="text-xs text-muted-foreground">Interactive GNSS-R Portal</p>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="weather" className="mt-6">
                      <div className="relative bg-muted rounded-xl overflow-hidden flex items-center justify-center" style={{ height: '500px' }}>
                        <div className="text-center space-y-6">
                          <div className="text-6xl">🌍</div>
                          <div>
                            <h3 className="text-xl font-semibold mb-2">Live Weather & Ocean Data</h3>
                            <p className="text-muted-foreground mb-6">
                              Access real-time weather conditions, wind patterns, and ocean data
                            </p>
                          </div>
                          <div className="flex flex-col gap-3">
                            <Button 
                              size="lg" 
                              onClick={() => window.open('https://www.windy.com/?25.000,78.000,4', '_blank')}
                              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:scale-105 transition-all"
                            >
                              🌊 Open Windy Weather Map
                            </Button>
                            <Button 
                              variant="outline" 
                              size="lg"
                              onClick={() => window.open('https://earth.nullschool.net/#current/wind/surface/level/orthographic=-282.65,25.44,1024', '_blank')}
                              className="hover:scale-105 transition-all"
                            >
                              🌪️ Earth Wind Map
                            </Button>
                            <Button 
                              variant="outline" 
                              size="lg"
                              onClick={() => window.open('https://www.ventusky.com/?p=25.0;78.0;4&l=wind-10m', '_blank')}
                              className="hover:scale-105 transition-all"
                            >
                              🌬️ Ventusky Weather
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
              
              <div className="mt-6 flex flex-wrap gap-4 justify-center">
                <Button
                  size="lg"
                  className="group bg-gradient-to-r from-primary to-secondary hover:scale-110 transition-all duration-300 glow-cyan"
                  onClick={() => window.open('https://iittnif-map.vercel.app/', '_blank')}
                >
                  <Play className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Full Screen Map
                  <Zap className="h-4 w-4 ml-2 group-hover:rotate-12 transition-transform" />
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="group hover:scale-105 transition-all duration-300 glass border-primary/20"
                  onClick={() => window.open('/delay-doppler-maps', '_self')}
                >
                  <BarChart3 className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  DDM Analysis
                </Button>
              </div>
              
              <p className="text-center text-muted-foreground mt-6 text-lg">
                🌍 Explore real interactive data portals • 📡 Access live weather and ocean conditions • �️ Navigate real-time maps
              </p>
            </CardContent>
          </Card>
      </div>
    </section>

      {/* Enhanced Use Cases Section */}
      <section ref={useCasesRef} className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Use Cases & Applications
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover how GNSS-R technology is revolutionizing Earth observation across multiple domains
            </p>
          </div>

          <Tabs defaultValue="ocean" className="max-w-7xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-12 glass">
              {useCases.map((useCase) => {
                const Icon = useCase.icon
                return (
                  <TabsTrigger
                    key={useCase.id}
                    value={useCase.id}
                    className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white transition-all duration-300 hover:scale-105"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{useCase.title}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {useCases.map((useCase) => {
              const Icon = useCase.icon
              return (
                <TabsContent key={useCase.id} value={useCase.id} className="mt-8 animate-fade-in-up">
                  <Card className="glass-card shadow-2xl glow-purple">
                    <CardContent className="p-0">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                        {/* Content Side */}
                        <div className="p-8 lg:p-12 flex flex-col justify-center space-y-6">
                          <div className="flex items-center gap-4 mb-4">
                            <div className={`w-16 h-16 rounded-2xl glass flex items-center justify-center glow-${useCase.color === "blue" ? "cyan" : useCase.color === "purple" ? "purple" : "cyan"}`}>
                              <Icon className={`h-8 w-8 text-${useCase.color}-400`} />
                            </div>
                            <h3 className="text-3xl font-bold text-gradient-cyan">{useCase.title}</h3>
                          </div>

                          <p className="text-lg text-muted-foreground leading-relaxed">{useCase.description}</p>

                          <div className="space-y-3">
                            <h4 className="text-lg font-semibold text-primary">Key Capabilities:</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {useCase.features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full bg-${useCase.color}-400 animate-pulse-slow`}></div>
                                  <span className="text-sm text-muted-foreground">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3 pt-4">
                            <Button className="group bg-gradient-to-r from-primary to-secondary text-white hover:scale-105 transition-all duration-300 glow-cyan">
                              Launch Analysis Tool
                              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button
                              variant="outline"
                              className="group hover:scale-105 transition-all duration-300 glass border-primary/30 hover:border-primary/50"
                            >
                              <BookOpen className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                              View Documentation
                            </Button>
                          </div>
                        </div>

                        {/* Image Side */}
                        <div className="relative overflow-hidden lg:rounded-r-lg">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10"></div>
                          <img
                            src={useCase.image || ph(800, 600, useCase.id)}
                            alt={`${useCase.title} visualization`}
                            className="w-full h-full object-cover min-h-[300px] lg:min-h-[500px] hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )
            })}
          </Tabs>
        </div>
      </section>

      {/* Enhanced How it Works Section */}
      <section ref={howItWorksRef} className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 to-primary/5"></div>
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient-purple">
              How It Works
            </h2>
            <p className="text-xl text-foreground max-w-3xl mx-auto">
              Understanding the GNSS-R process from signal transmission to parameter retrieval
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Step Navigation */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <div
                    key={index}
                    className={`text-center cursor-pointer transition-all duration-300 group ${
                      activeStep === index ? "scale-105" : "opacity-70 hover:opacity-100 hover:scale-105"
                    }`}
                    onClick={() => setActiveStep(index)}
                  >
                    <div
                      className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-3 transition-all duration-300 ${
                        activeStep === index
                          ? "glass glow-cyan text-primary" 
                          : "glass-card group-hover:glow-cyan"
                      }`}
                    >
                      <Icon
                        className={`h-8 w-8 transition-transform duration-300 ${
                          activeStep === index ? "scale-110 text-primary" : "group-hover:scale-110"
                        }`}
                      />
                    </div>
                    <p className="text-sm font-medium leading-tight">{step.title}</p>
                    <div
                      className={`w-8 h-1 mx-auto mt-2 rounded-full transition-all duration-300 ${
                        activeStep === index ? "bg-primary glow-cyan" : "bg-muted" 
                      }`}
                    ></div>
                  </div>
                )
              })}
            </div>

            {/* Step Content */}
            <Card className="glass-card shadow-2xl glow-purple animate-fade-in">
              <CardContent className="p-8 lg:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center font-bold text-xl glow-cyan"> 
                        {activeStep + 1}
                      </div>
                      <h3 className="text-2xl font-bold text-gradient-cyan">{steps[activeStep].title}</h3>
                    </div>
                    <p className="text-lg text-muted-foreground leading-relaxed">{steps[activeStep].description}</p>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                        disabled={activeStep === 0}
                        className="hover:scale-105 transition-all duration-300 glass border-primary/30 hover:border-primary/50"
                      >
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
                        disabled={activeStep === steps.length - 1}
                        className="hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary to-secondary glow-cyan" 
                      >
                        Next
                      </Button>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-50 animate-pulse-slow"></div> 
                    <img
                      src={ph(900, 600, `step-${activeStep + 1}`)}
                      alt={`Step ${activeStep + 1}: ${steps[activeStep].title}`}
                      className="relative w-full h-auto rounded-xl shadow-lg glass hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced Latest Updates Section */}
      <section ref={updatesRef} className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient-cyan">
              Latest Updates
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Stay informed about the latest developments, research, and features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {updatesLoading ? (
              // Loading state
              Array.from({ length: 3 }).map((_, index) => (
                <Card
                  key={`loading-${index}`}
                  className="glass-card animate-pulse"
                >
                  <div className="h-40 bg-muted rounded-t-xl"></div>
                  <CardHeader className="space-y-4">
                    <div className="h-4 bg-muted rounded w-20"></div>
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-5/6"></div>
                    </div>
                    <div className="h-8 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : updates.length === 0 ? (
              // Empty state
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground text-lg">No updates available at the moment.</p>
                <p className="text-muted-foreground text-sm mt-2">Check back later for the latest GNSS-R developments.</p>
              </div>
            ) : (
              // Actual updates
              updates.map((update, index) => {
                return (
                  <Card
                    key={update.id}
                    className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 glass-card hover:glow-cyan animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="relative overflow-hidden rounded-t-xl">
                      <img
                        src={update.imageUrl}
                        alt={update.title}
                        className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                        onError={(e) => {
                          // Fallback to a placeholder if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.src = `https://picsum.photos/seed/${update.id}/800/400`;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent"></div>
                      <div className="absolute top-4 left-4">
                        <Badge
                          variant="secondary"
                          className={`glass bg-${update.color}-500/20 text-${update.color}-300 border-${update.color}-500/30`}
                        >
                          {update.type}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{update.date}</span>
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">
                        {update.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CardDescription className="leading-relaxed">{update.description}</CardDescription>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="group/btn hover:scale-105 transition-all duration-300 glass border-primary/30 hover:border-primary/50 w-full"
                      >
                        <a href={update.link} target="_blank" rel="noopener noreferrer">
                          {update.action}
                          <ExternalLink className="h-3 w-3 ml-2 inline-block align-middle group-hover/btn:rotate-12 transition-transform" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="glass py-16 px-4 border-t border-white/10">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Satellite className="h-6 w-6 text-primary animate-float glow-cyan" />
                  <Waves className="h-5 w-5 text-secondary animate-float glow-purple" />
                </div>
                <span className="text-lg font-semibold text-gradient-cyan">GNSS-R Web Tool</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Advanced GNSS-R data visualization and analysis platform for researchers worldwide.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-primary">Resources</h4>
              <div className="space-y-2">
                {["Documentation", "API Reference", "Tutorials", "Examples"].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-secondary">Community</h4>
              <div className="space-y-2">
                {["GitHub", "Research Papers", "Webinars", "Support"].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="block text-sm text-muted-foreground hover:text-secondary transition-colors duration-300"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-primary">Connect</h4>
              <div className="flex space-x-4">
                {[
                  { icon: Github, label: "GitHub" },
                  { icon: Mail, label: "Email" },
                  { icon: BookOpen, label: "Documentation" },
                ].map((social) => {
                  const Icon = social.icon
                  return (
                    <a
                      key={social.label}
                      href="#"
                      className="w-10 h-10 rounded-lg glass hover:glow-cyan flex items-center justify-center transition-all duration-300 hover:scale-110"
                      aria-label={social.label}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10">
            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm mb-4 md:mb-0">
              {["Contact", "Privacy Policy", "Terms of Service", "API"].map((item) => (
                <a key={item} href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300">
                  {item}
                </a>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">© 2025 GNSS-R Web Tool. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
