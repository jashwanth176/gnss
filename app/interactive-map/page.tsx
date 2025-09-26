"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
import "leaflet/dist/leaflet.css"
import { initializeChartJS } from "@/lib/chartSetup"
import L from "leaflet"
import { SiteLogo } from "@/components/SiteLogo"

type SeriesPoint = { year: number; doy: number; value: number }
type ParameterSeries = {
  display: string
  unit?: string
  series: SeriesPoint[]
  latest?: SeriesPoint
}
export type LocationData = {
  name: string
  lat: number
  lon: number
  region?: string
  parameters: Record<string, ParameterSeries | any>
}

const MeteoMap = dynamic(() => import("@/components/meteomap/MeteoMap"), { ssr: false })

export default function InteractiveMapPage() {
  const [locations, setLocations] = useState<LocationData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mapRef = useRef<L.Map>(null!)

  useEffect(() => {
    initializeChartJS()
  }, [])

  useEffect(() => {
    const loadData = async () => {
      try {
        const now = new Date()
        const lastYear = now.getFullYear() - 1
        const base: LocationData[] = [
          { name: "IISc Bangalore", lat: 12.9716, lon: 77.5946, region: "South India", parameters: {} },
          { name: "IIT Kanpur", lat: 26.4499, lon: 80.3319, region: "North India", parameters: {} },
          { name: "IIT Tirupati", lat: 13.6288, lon: 79.4192, region: "South India", parameters: {} },
        ]

        const { fetchCsvSeries } = await import("@/lib/csv")

        const smFiles = [
          { name: "IISc Bangalore", file: `Bangalore_ERA5_SM_${lastYear}-01-01_${lastYear}-12-31.csv` },
          { name: "IIT Kanpur", file: `Kanpur_ERA5_SM_${lastYear}-01-01_${lastYear}-12-31.csv` },
          { name: "IIT Tirupati", file: `Tirupati_ERA5_SM_${lastYear}-01-01_${lastYear}-12-31.csv` },
        ]
        const rainFiles = [
          { name: "IISc Bangalore", file: `Bangalore_ERA5_PRECTOT_${lastYear}-01-01_${lastYear}-12-31.csv` },
          { name: "IIT Kanpur", file: `Kanpur_ERA5_PRECTOT_${lastYear}-01-01_${lastYear}-12-31.csv` },
          { name: "IIT Tirupati", file: `Tirupati_ERA5_PRECTOT_${lastYear}-01-01_${lastYear}-12-31.csv` },
        ]

        const locs = [...base]

        // Soil Moisture
        await Promise.all(
          smFiles.map(async ({ name, file }) => {
            const loc = locs.find(l => l.name === name)
            if (!loc) return
            const urls = [`/era5_points/${file}`, `/build/era5_points/${file}`]
            let series: SeriesPoint[] = []
            for (const u of urls) {
              try {
                series = await fetchCsvSeries(u, "sm_swvl1")
                if (series.length) break
              } catch {}
            }
            const filtered = series.filter(p => p.year === lastYear).sort((a, b) => a.doy - b.doy)
            if (!filtered.length) return
            loc.parameters["SM"] = {
              display: "Soil Moisture (ERA5-Land, Surface Layer)",
              unit: "m³/m³",
              series: filtered,
              latest: filtered[filtered.length - 1],
            }
          })
        )

        // Rainfall
        await Promise.all(
          rainFiles.map(async ({ name, file }) => {
            const loc = locs.find(l => l.name === name)
            if (!loc) return
            const urls = [`/era5_points/${file}`, `/build/era5_points/${file}`]
            let series: SeriesPoint[] = []
            for (const u of urls) {
              try {
                series = await fetchCsvSeries(u, "prectot", 1)
                if (series.length) break
              } catch {}
            }
            const filtered = series.filter(p => p.year === lastYear).sort((a, b) => a.doy - b.doy)
            if (!filtered.length) return
            loc.parameters["PRECTOT"] = {
              display: "Rainfall (Daily Total)",
              unit: "mm/day",
              series: filtered,
              latest: filtered[filtered.length - 1],
            }
          })
        )

        setLocations(locs)
        setLoading(false)
      } catch (e: any) {
        setError(e?.message || "Failed to load data")
        setLoading(false)
      }
    }
    loadData()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <a href="/" className="inline-flex items-center text-sm text-black hover:text-primary">
              <span className="mr-2">←</span> Back to Home
            </a>
            <SiteLogo size="md" className="rounded-lg shadow" />
          </div>
        </div>

        <div className="mb-5">
          <h1 className="text-3xl font-bold tracking-tight text-black">Interactive Map & City Comparison</h1>
          <p className="text-sm text-muted-foreground mt-1">ERA5 daily points from public/era5_points with soil moisture and rainfall. Click ➕ on labels to compare.</p>
        </div>

        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 text-red-700 px-3 py-2 mb-3">{error}</div>
        )}

        <div className="rounded-xl overflow-hidden border shadow bg-background" style={{ height: "72vh", width: "100%" }}>
          <MeteoMap locations={locations} mapRef={mapRef} />
        </div>
        {loading && <div className="mt-3 text-sm">Loading meteorological data…</div>}
      </div>
    </div>
  )
}
