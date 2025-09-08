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
import dynamic from 'next/dynamic';
import { fetchLatestUpdates } from "@/lib/fetchArxivUpdates"

const SatelliteMap = dynamic(() => import("@/components/SatelliteMap"), { ssr: false });

export default function HomePage() {
  const [activeStep, setActiveStep] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const heroRef = useRef<HTMLElement>(null)
  const featuresRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null);

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

  // Remote placeholder generator (picsum) for steps and fallbacks
  const ph = (w: number, h: number, seed?: string) =>
    `https://picsum.photos/${w}/${h}${seed ? `?random=${encodeURIComponent(seed)}` : ''}`

  const [updates, setUpdates] = useState<Awaited<ReturnType<typeof fetchLatestUpdates>>>([])

  useEffect(() => {
    let mounted = true
    fetchLatestUpdates().then((data) => {
      if (mounted) setUpdates(data)
    })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center space-x-2">
              <div className="relative">
                <Satellite className="h-8 w-8 text-primary animate-pulse" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary/30 rounded-full animate-ping"></div>
              </div>
              <Waves className="h-6 w-6 text-primary/70 animate-bounce" style={{ animationDelay: "0.5s" }} />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                GNSS-R Tool
              </span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center space-x-8">
            {["Home", "Data Portal", "Live Visualization", "Documentation", "Contact"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm font-medium hover:text-primary transition-all duration-300 relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="hidden sm:flex items-center space-x-2">
              <Button variant="outline" size="sm" className="hover:scale-105 transition-transform bg-transparent">
                Login
              </Button>
              <Button
                size="sm"
                className="hover:scale-105 transition-transform bg-gradient-to-r from-primary to-secondary"
              >
                Sign Up
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t bg-background/95 backdrop-blur-md">
            <div className="container py-4 space-y-4">
              {["Home", "Data Portal", "Live Visualization", "Documentation", "Contact"].map((item) => (
                <a key={item} href="#" className="block text-sm font-medium hover:text-primary transition-colors">
                  {item}
                </a>
              ))}
              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  Login
                </Button>
                <Button size="sm" className="flex-1">
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section with Parallax */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 backdrop-blur-[2px]"
        style={{
          background: `linear-gradient(135deg, 
            hsl(var(--primary) / 0.05) 0%, 
            hsl(var(--background)) 50%, 
            hsl(var(--secondary) / 0.05) 100%)`,
        }}
      >
        {/* Video Background */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40 filter blur-md"  // Adjust opacity (0-1) and blur (px) as needed
          src="/854518-hd_1920_1080_30fps.mp4"
        />

  {/* 3D Earth removed to simplify dependencies */}

        {/* Parallax Background Elements */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        >
          <div className="absolute top-20 left-10 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <div
            className="absolute top-40 right-20 w-3 h-3 bg-secondary rounded-full animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-40 left-1/4 w-1 h-1 bg-primary rounded-full animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute bottom-60 right-1/3 w-2 h-2 bg-secondary rounded-full animate-pulse"
            style={{ animationDelay: "0.5s" }}
          ></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="space-y-4 animate-fade-in-up">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient">
                  Global Navigation Satellite System
                </span>
                <br />
                <span
                  className="bg-gradient-to-r from-secondary via-primary to-secondary bg-clip-text text-transparent animate-gradient"
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
                className="group hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary to-secondary"
              >
                <Search className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                Explore Live Data
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="group hover:scale-105 transition-all duration-300 bg-background/50 backdrop-blur-sm"
              >
                <TrendingUp className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                View Delay-Doppler Maps
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="group hover:scale-105 transition-all duration-300 bg-background/50 backdrop-blur-sm"
              >
                <Brain className="h-5 w-5 mr-2 group-hover:pulse transition-all" />
                Try AI Soil Moisture Estimator
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="group hover:scale-105 transition-all duration-300 bg-background/50 backdrop-blur-sm"
              >
                <Download className="h-5 w-5 mr-2 group-hover:bounce transition-all" />
                Download Sample Dataset
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

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-6 w-6 text-muted-foreground" />
        </div>
      </section>
     
      {/* Key Features Section */}
      <section ref={featuresRef} className="py-24 px-4 relative">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
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
                  className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 border-0 bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="relative mx-auto mb-4">
                      <div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-${feature.color.split("-")[1]}-500/20 to-${feature.color.split("-")[1]}-600/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon
                          className={`h-8 w-8 ${feature.color} group-hover:rotate-12 transition-transform duration-300`}
                        />
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
      <section className="py-24 px-4 bg-gradient-to-br from-muted/30 to-background">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Live Global Data Preview
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore real-time GNSS-R observations from around the world
            </p>
          </div>

          <Card className="max-w-6xl mx-auto group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-background to-muted/50 backdrop-blur-sm animate-fade-in-up">
            <CardContent className="p-8">
              <div className="relative overflow-hidden rounded-xl">
                <SatelliteMap />
            </div>
            <div className="mt-4 text-center">
              <Button
                size="lg"
                className="group bg-primary/90 hover:bg-primary backdrop-blur-sm hover:scale-110 transition-all duration-300"
                onClick={() => window.open('https://iittnif-map.vercel.app/', '_blank')}
              >
                <Play className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Launch Interactive Map
                <Zap className="h-4 w-4 ml-2 group-hover:rotate-12 transition-transform" />
              </Button>
            </div>
            <p className="text-center text-muted-foreground mt-6 text-lg">
              Click on observation points to view DDM, SNR plots, and real-time data analysis
            </p>
          </CardContent>
        </Card>
      </div>
    </section>

      {/* Enhanced Use Cases Section */}
      <section className="py-24 px-4">
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
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-12 bg-muted/50 backdrop-blur-sm">
              {useCases.map((useCase) => {
                const Icon = useCase.icon
                return (
                  <TabsTrigger
                    key={useCase.id}
                    value={useCase.id}
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
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
                  <Card className="border-0 bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm shadow-2xl">
                    <CardContent className="p-0">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                        {/* Content Side */}
                        <div className="p-8 lg:p-12 flex flex-col justify-center space-y-6">
                          <div className="flex items-center gap-4 mb-4">
                            <div
                              className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-${useCase.color}-500/20 to-${useCase.color}-600/20 flex items-center justify-center`}
                            >
                              <Icon className={`h-8 w-8 text-${useCase.color}-500`} />
                            </div>
                            <h3 className="text-3xl font-bold">{useCase.title}</h3>
                          </div>

                          <p className="text-lg text-muted-foreground leading-relaxed">{useCase.description}</p>

                          <div className="space-y-3">
                            <h4 className="text-lg font-semibold">Key Capabilities:</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {useCase.features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full bg-${useCase.color}-500`}></div>
                                  <span className="text-sm text-muted-foreground">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3 pt-4">
                            <Button
                              className={`group bg-${useCase.color}-500 hover:bg-${useCase.color}-600 text-white hover:scale-105 transition-all duration-300`}  // Added text-white
                            >
                              Launch Analysis Tool
                              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button
                              variant="outline"
                              className="group hover:scale-105 transition-all duration-300 bg-background/50 backdrop-blur-sm"
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
      <section className="py-24 px-4 bg-gradient-to-br from-muted/30 to-background">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
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
                          ? "bg-gradient-to-br from-teal-500 to-indigo-400 text-white shadow-lg" 
                          : "bg-muted group-hover:bg-muted/80"
                      }`}
                    >
                      <Icon
                        className={`h-8 w-8 transition-transform duration-300 ${activeStep === index ? "scale-110" : "group-hover:scale-110"}`}
                      />
                    </div>
                    <p className="text-sm font-medium leading-tight">{step.title}</p>
                    <div
                      className={`w-8 h-1 mx-auto mt-2 rounded-full transition-all duration-300 ${
                        activeStep === index ? "bg-teal-500" : "bg-muted" 
                      }`}
                    ></div>
                  </div>
                )
              })}
            </div>

            {/* Step Content */}
            <Card className="border-0 bg-gradient-to-br from-background to-muted/50 backdrop-blur-sm shadow-2xl animate-fade-in">
              <CardContent className="p-8 lg:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-400 text-white flex items-center justify-center font-bold text-xl"> 
                        {activeStep + 1}
                      </div>
                      <h3 className="text-2xl font-bold">{steps[activeStep].title}</h3>
                    </div>
                    <p className="text-lg text-muted-foreground leading-relaxed">{steps[activeStep].description}</p>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                        disabled={activeStep === 0}
                        className="hover:scale-105 transition-all duration-300"
                      >
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
                        disabled={activeStep === steps.length - 1}
                        className="hover:scale-105 transition-all duration-300 bg-gradient-to-r from-teal-500 to-indigo-400" 
                      >
                        Next
                      </Button>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/20 to-indigo-400/20 rounded-2xl blur-xl opacity-50"></div> 
                    <img
                      src={ph(900, 600, `step-${activeStep + 1}`)}
                      alt={`Step ${activeStep + 1}: ${steps[activeStep].title}`}
                      className="relative w-full h-auto rounded-xl shadow-lg border border-border/50 hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced Latest Updates Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Latest Updates
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Stay informed about the latest developments, research, and features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {updates.map((update, index) => {
              return (
                <Card
                  key={update.id}
                  className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 border-0 bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative overflow-hidden rounded-t-xl">
                    <img
                      src={update.imageUrl}
                      alt={update.title}
                      className="w-full h-40 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent"></div>
                  </div>
                  <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="secondary"
                        className={`bg-${update.color}-500/10 text-${update.color}-600 border-${update.color}-500/20`}
                      >
                        {update.type}
                      </Badge>
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
                      className="group/btn hover:scale-105 transition-all duration-300 bg-background/50 backdrop-blur-sm w-full"
                    >
                      <a href={update.link} target="_blank" rel="noopener noreferrer">
                        {update.action}
                        <ExternalLink className="h-3 w-3 ml-2 inline-block align-middle group-hover/btn:rotate-12 transition-transform" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-br from-muted/50 to-background py-16 px-4 border-t backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Satellite className="h-6 w-6 text-primary" />
                  <Waves className="h-5 w-5 text-primary/70" />
                </div>
                <span className="text-lg font-semibold">GNSS-R Web Tool</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Advanced GNSS-R data visualization and analysis platform for researchers worldwide.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Resources</h4>
              <div className="space-y-2">
                {["Documentation", "API Reference", "Tutorials", "Examples"].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Community</h4>
              <div className="space-y-2">
                {["GitHub", "Research Papers", "Webinars", "Support"].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Connect</h4>
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
                      className="w-10 h-10 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all duration-300 hover:scale-110"
                      aria-label={social.label}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border/50">
            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm mb-4 md:mb-0">
              {["Contact", "Privacy Policy", "Terms of Service", "API"].map((item) => (
                <a key={item} href="#" className="text-muted-foreground hover:text-primary transition-colors">
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
