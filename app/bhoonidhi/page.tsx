"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, ExternalLink, Database, Sprout, Mountain, Copy } from "lucide-react"
import { SiteLogo } from "@/components/SiteLogo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const BHOONIDHI_URL = "https://bhoonidhi.nrsc.gov.in/bhoonidhi/index.html"

export default function BhoonidhiPage() {
  const [embedReady, setEmbedReady] = useState(false)
  const [embedBlocked, setEmbedBlocked] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      if (!embedReady) setEmbedBlocked(true)
    }, 3500)
    return () => clearTimeout(t)
  }, [embedReady])

  const soilKeywords = useMemo(() => [
    "Soil Moisture",
    "SM Product",
    "Microwave Soil Moisture",
    "RISAT Soil Moisture",
    "SAR Soil Moisture",
  ], [])

  const demKeywords = useMemo(() => [
    "DEM",
    "Digital Elevation Model",
    "CartoDEM",
    "ISRO DEM",
    "Topography",
  ], [])

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(text)
      setTimeout(() => setCopied(null), 1500)
    } catch {}
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
                  <h1 className="text-2xl font-bold text-black">Bhoonidhi (NRSC) Portal</h1>
                  <p className="text-sm text-black">Access EOS/ISRO satellite data for Soil Moisture and DEM</p>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <a href={BHOONIDHI_URL} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="glass border-primary/30">
                  Open in new tab
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" /> EOS/ISRO Data Access
              </CardTitle>
              <CardDescription>
                Use the official NRSC Bhoonidhi portal to discover, preview and request access to Earth Observation datasets.
                This includes Soil Moisture products and Digital Elevation Models (DEM) from ISRO missions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg overflow-hidden border bg-background/50 relative">
                <iframe
                  src={BHOONIDHI_URL}
                  title="Bhoonidhi Portal"
                  className="w-full"
                  style={{ minHeight: "70vh" }}
                  onLoad={() => setEmbedReady(true)}
                  onError={() => setEmbedBlocked(true)}
                />
                {embedBlocked && !embedReady && (
                  <div className="absolute inset-0">
                    {/* Blurred preview background */}
                    {!previewError && (
                      <img
                        src="/fb.jpeg"
                        alt="Bhoonidhi preview"
                        className="absolute inset-0 w-full h-full object-cover blur-lg scale-105"
                        onError={() => setPreviewError(true)}
                      />
                    )}
                    {/* Dark overlay for contrast */}
                    <div className="absolute inset-0 bg-background/60" />
                    {/* Centered CTA button */}
                    <div className="absolute inset-0 flex items-center justify-center p-6">
                      <a href={BHOONIDHI_URL} target="_blank" rel="noopener noreferrer">
                        <Button size="lg" className="bg-gradient-to-r from-primary to-secondary shadow-xl">
                          Open Bhoonidhi in new tab
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Guides and Resources */}
              <div className="mt-8">
                <Accordion type="multiple" className="w-full" defaultValue={["soil", "dem", "resources"]}>
                  <AccordionItem value="soil" className="border rounded-lg">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Sprout className="h-5 w-5 text-primary" /> Soil Moisture: how to find datasets
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 space-y-3 text-sm text-muted-foreground">
                      <ol className="list-decimal list-inside space-y-2">
                        <li>Open the Bhoonidhi portal (use the button above).</li>
                        <li>Use Search and filter by parameters like “Soil Moisture”, sensor (e.g., SAR), mission, or area of interest.</li>
                        <li>Preview metadata and product details, then follow the portal workflow to request/download.</li>
                      </ol>
                      <div className="pt-2">
                        <p className="text-foreground font-medium mb-2">Helpful keywords:</p>
                        <div className="flex flex-wrap gap-2">
                          {soilKeywords.map((k) => (
                            <Button key={k} size="sm" variant="secondary" onClick={() => copyText(k)}>
                              {k}
                              <Copy className="h-3 w-3 ml-2" />
                            </Button>
                          ))}
                        </div>
                        {copied && <p className="text-xs text-primary mt-2">Copied “{copied}” to clipboard</p>}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="dem" className="border rounded-lg">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Mountain className="h-5 w-5 text-primary" /> DEM: how to find elevation data
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 space-y-3 text-sm text-muted-foreground">
                      <ol className="list-decimal list-inside space-y-2">
                        <li>Open the Bhoonidhi portal (use the button above).</li>
                        <li>Search “DEM” or “CartoDEM”, select resolution and area of interest.</li>
                        <li>Review licensing and request data as per portal instructions.</li>
                      </ol>
                      <div className="pt-2">
                        <p className="text-foreground font-medium mb-2">Helpful keywords:</p>
                        <div className="flex flex-wrap gap-2">
                          {demKeywords.map((k) => (
                            <Button key={k} size="sm" variant="secondary" onClick={() => copyText(k)}>
                              {k}
                              <Copy className="h-3 w-3 ml-2" />
                            </Button>
                          ))}
                        </div>
                        {copied && <p className="text-xs text-primary mt-2">Copied “{copied}” to clipboard</p>}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="resources" className="border rounded-lg">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-primary" /> Related open datasets (optional alternates)
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground space-y-2">
                      <p>In addition to Bhoonidhi, you can explore other open sources for background datasets:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>
                          <a className="text-primary hover:underline" href="https://search.earthdata.nasa.gov/" target="_blank" rel="noopener noreferrer">NASA Earthdata Search</a> (e.g., SMAP soil moisture)
                        </li>
                        <li>
                          <a className="text-primary hover:underline" href="https://portal.opentopography.org/" target="_blank" rel="noopener noreferrer">OpenTopography</a> (DEM collections)
                        </li>
                        <li>
                          <a className="text-primary hover:underline" href="https://registry.opendata.aws/copernicus-dem/" target="_blank" rel="noopener noreferrer">Copernicus DEM (AWS)</a>
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
