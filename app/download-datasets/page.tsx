"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Download, HardDrive, Info, Satellite } from "lucide-react"

type LocalNcFile = {
  name: string
  sizeBytes: number
  sizeMB: number
  modified: string
}

export default function CygnssDownloadsPage() {
  const [files, setFiles] = useState<LocalNcFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState("")

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/local-cygnss', { cache: 'no-store' })
      const data = await res.json()
      if (res.ok) {
        setFiles(data.files || [])
      } else {
        setError(data.error || 'Failed to load files')
      }
    } catch (e: any) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = files.filter(f => f.name.toLowerCase().includes(filter.toLowerCase()))

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b glass-header sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-black">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <Image src="/Logo.png" alt="GNSS-R Portal" width={28} height={28} className="rounded" />
                <Image src="/IIT_Tirupati_logo.svg" alt="IIT Tirupati" width={24} height={24} className="rounded" />
                <Satellite className="w-5 h-5 text-[hsl(var(--primary))]" />
                <div>
                  <h1 className="text-xl font-bold text-black">CYGNSS Data</h1>
                  <CardDescription>Local NetCDF files and setup guide</CardDescription>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main column */}
          <div className="lg:col-span-3 space-y-6">
            {/* External real data sources */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Real CYGNSS Data (External)
                </CardTitle>
                <CardDescription>
                  Download official CYGNSS Level-1 data directly from NASA PO.DAAC / Earthdata. Sign-in required.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Link href="https://podaac.jpl.nasa.gov/dataset/CYGNSS_L1_V3.0">
                  <Button className="bg-[hsl(var(--primary))] text-white" variant="default">
                    Open CYGNSS L1 V3.0 on PO.DAAC →
                  </Button>
                </Link>
                <Link href="https://search.earthdata.nasa.gov/search?p=C1996881146-POCLOUD">
                  <Button variant="outline" className="border-[hsl(var(--primary))]/30">
                    Earthdata Search (CYGNSS granules)
                  </Button>
                </Link>
                <Link href="https://urs.earthdata.nasa.gov/">
                  <Button variant="outline" className="border-[hsl(var(--primary))]/30">
                    Sign in / Create Earthdata Account
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-[hsl(var(--primary))]" />
                  Local CYGNSS NetCDF Files
                </CardTitle>
                <CardDescription>
                  Files are read from your project's <code>data/</code> folder. Place downloaded <code>.nc</code> files there.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Label htmlFor="filter">Filter</Label>
                    <Input id="filter" placeholder="Filter by filename" value={filter} onChange={(e) => setFilter(e.target.value)} />
                  </div>
                  <Button variant="outline" onClick={load}>Refresh</Button>
                </div>

                {loading && (
                  <div className="space-y-2">
                    <Progress value={60} className="h-2" />
                    <p className="text-sm text-muted-foreground">Scanning data directory…</p>
                  </div>
                )}

                {error && (
                  <div className="text-sm text-red-600">{error}</div>
                )}

                {!loading && filtered.length === 0 && !error && (
                  <div className="text-sm text-muted-foreground">
                    No NetCDF files found. Follow the setup guide to download CYGNSS data and place it in <code>data/</code>.
                  </div>
                )}

                <div className="space-y-3">
                  {filtered.map((f) => (
                    <div key={f.name} className="flex items-center justify-between p-3 rounded border bg-white/70 border-[hsl(var(--primary))]/20">
                      <div>
                        <div className="font-mono text-sm text-foreground">{f.name}</div>
                        <div className="text-xs text-muted-foreground">{f.sizeMB} MB • Updated {new Date(f.modified).toLocaleString()}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">.nc</Badge>
                        <a href={`/api/local-cygnss?file=${encodeURIComponent(f.name)}`}>
                          <Button size="sm" variant="outline" className="border-[hsl(var(--primary))]/30">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-[hsl(var(--primary))]" />
                  How to get CYGNSS data
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <p>
                  CYGNSS Level-1 data is freely available from NASA PO.DAAC. Download <code>.nc</code> files and drop them into your <code>data/</code> folder. They will appear here automatically.
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Create a free Earthdata account</li>
                  <li>Install the official downloader</li>
                  <li>Download a day or week of CYGNSS L1 files</li>
                </ul>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[hsl(var(--primary))]/30"
                    onClick={() => navigator.clipboard.writeText('pip install podaac-data-downloader')}
                    title="Copy pip install command"
                  >
                    Copy: pip install
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[hsl(var(--primary))]/30"
                    onClick={() => navigator.clipboard.writeText('podaac-data-downloader -c CYGNSS_L1_V3.0 -d ./data -e .nc --start-date 2018-08-01T00:00:00Z --end-date 2018-08-02T00:00:00Z')}
                    title="Copy sample download command"
                  >
                    Copy sample download
                  </Button>
                </div>
                <div>
                  <Link href="/docs/cygnss">
                    <Button size="sm" variant="outline" className="border-[hsl(var(--primary))]/30">Open detailed guide →</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
