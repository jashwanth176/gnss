"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Tooltip as LeafletTooltip, useMap } from 'react-leaflet'
import L, { DivIcon, Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Line } from 'react-chartjs-2'
import type { LocationData } from '@/app/interactive-map/page'

// Fix default marker assets when needed
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete (Icon.Default.prototype as any)._getIconUrl
Icon.Default.mergeOptions({
  iconUrl: markerIcon.src ?? markerIcon,
  iconRetinaUrl: markerIcon2x.src ?? markerIcon2x,
  shadowUrl: markerShadow.src ?? markerShadow,
})

// Helper to safely expose the Leaflet map instance from context
function SetMapRef({ refObj }: { refObj: React.RefObject<L.Map> }) {
  const map = useMap()
  useEffect(() => {
    if (map && refObj && !(refObj as any).current) {
      ;(refObj as any).current = map
    }
  }, [map, refObj])
  return null
}

function createDot(color: string) {
  return new DivIcon({
    className: 'custom-div-icon',
    html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid #222"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}

const smStops = [
  { v: 0.0, c: '#e0f7e9' },
  { v: 0.1, c: '#7ed957' },
  { v: 0.2, c: '#2ecc40' },
  { v: 0.3, c: '#145a32' },
]
const hex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
const hexToRgb = (h: string) => {
  const x = h.replace('#', '')
  const n = parseInt(x.length === 3 ? x.split('').map(c => c + c).join('') : x, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}
const rgbToHex = (r: number, g: number, b: number) => `#${hex(r)}${hex(g)}${hex(b)}`
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
function smColor(v: number) {
  const value = Math.max(0, Math.min(0.3, v))
  for (let i = 0; i < smStops.length - 1; i++) {
    const a = smStops[i], b = smStops[i + 1]
    if (value >= a.v && value <= b.v) {
      const t = (value - a.v) / (b.v - a.v || 1)
      const A = hexToRgb(a.c), B = hexToRgb(b.c)
      return rgbToHex(lerp(A.r, B.r, t), lerp(A.g, B.g, t), lerp(A.b, B.b, t))
    }
  }
  return smStops[smStops.length - 1].c
}

type Props = {
  locations: LocationData[]
  mapRef?: React.RefObject<L.Map>
}

export default function MeteoMap({ locations, mapRef }: Props) {
  const [selected, setSelected] = useState<{ city: string; param: string } | null>(null)
  const [compareOpen, setCompareOpen] = useState(false)
  const [compareCities, setCompareCities] = useState<string[]>([])
  const [smIndex, setSmIndex] = useState(0)
  const [smPlaying, setSmPlaying] = useState(false)
  const [smSpeedMs, setSmSpeedMs] = useState(800)
  const [options, setOptions] = useState({
    smooth: false,
    sharedYSm: true,
    sharedYRain: false,
    range: 'all' as 'all' | 'H1' | 'MON' | 'H2',
    baseline: '' as string,
    showDelta: false,
  })

  const center: [number, number] = [23, 80]

  const selectedData = useMemo(() => {
    if (!selected) return null
    const loc = locations.find(l => l.name === selected.city)
    if (!loc) return null
    const param = loc.parameters[selected.param]
    return { loc, param }
  }, [locations, selected])

  // Pick a primary SM series to drive the timeline (selected city first, else first compared, else any)
  const primarySmSeries = useMemo(() => {
    if (selected?.param === 'SM') {
      const loc = locations.find(l => l.name === selected.city)
      const s = loc?.parameters?.['SM']?.series as any[] | undefined
      if (Array.isArray(s) && s.length) return s
    }
    if (compareCities.length) {
      const loc = locations.find(l => l.name === compareCities[0])
      const s = loc?.parameters?.['SM']?.series as any[] | undefined
      if (Array.isArray(s) && s.length) return s
    }
    const any = locations.find(l => Array.isArray((l.parameters?.['SM'] as any)?.series))
    return (any?.parameters?.['SM'] as any)?.series ?? []
  }, [locations, selected, compareCities])

  // Keep index in range and play/pause loop
  useEffect(() => {
    if (smIndex >= Math.max(0, primarySmSeries.length)) setSmIndex(0)
  }, [primarySmSeries, smIndex])

  useEffect(() => {
    if (!smPlaying || primarySmSeries.length === 0) return
    const id = setInterval(() => setSmIndex(i => (i + 1) % primarySmSeries.length), smSpeedMs)
    return () => clearInterval(id)
  }, [smPlaying, primarySmSeries, smSpeedMs])

  // Helpers
  const monthFromDoy = (year: number, doy: number) => {
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
    const days = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    let acc = 0
    for (let m = 0; m < 12; m++) {
      acc += days[m]
      if (doy <= acc) return m + 1
    }
    return 12
  }
  const applyRange = <T extends { year: number; doy: number; value: number }>(series: T[]) => {
    if (options.range === 'all') return series
    return series.filter(p => {
      const m = monthFromDoy(p.year, p.doy)
      if (options.range === 'H1') return m >= 1 && m <= 6
      if (options.range === 'MON') return m >= 7 && m <= 9
      return m >= 10 && m <= 12
    })
  }
  const smoothSeries = <T extends { value: number }>(series: T[], win = 7) => {
    if (!options.smooth || win <= 1) return series
    const out = series.map((p, i) => {
      const a = Math.max(0, i - Math.floor(win / 2))
      const b = Math.min(series.length - 1, i + Math.floor(win / 2))
      let sum = 0
      let n = 0
      for (let k = a; k <= b; k++) { sum += series[k].value; n++ }
      return { ...p, value: n ? sum / n : p.value }
    })
    return out as T[]
  }
  const clampIndexTo = (len: number) => Math.min(smIndex, Math.max(0, len - 1))
  const exportCsv = (paramKey: 'SM' | 'PRECTOT') => {
    if (compareCities.length === 0) return
    const loc0 = locations.find(l => l.name === compareCities[0])
    const base = applyRange(((loc0?.parameters?.[paramKey] as any)?.series || []) as { year: number; doy: number; value: number }[])
    const labels = base.map(d => `${d.year}-D${d.doy}`)
  const rows: string[] = []
    const header = ['label', ...compareCities].join(',')
    rows.push(header)
    for (let i = 0; i < labels.length; i++) {
      const row: (string | number)[] = [labels[i]]
      for (let c = 0; c < compareCities.length; c++) {
  const loc = locations.find(l => l.name === compareCities[c])
  const series = applyRange(((loc?.parameters?.[paramKey] as any)?.series || []) as { year: number; doy: number; value: number }[])
        let v = series[i]?.value
        if (options.smooth) {
          const s = smoothSeries(series)
          v = s[i]?.value
        }
        if (options.showDelta && options.baseline) {
          const baseLoc = locations.find(l => l.name === options.baseline)
          const baseSeries = applyRange(((baseLoc?.parameters?.[paramKey] as any)?.series || []) as { year: number; doy: number; value: number }[])
          const sBase = options.smooth ? smoothSeries(baseSeries) : baseSeries
          const bv = sBase[i]?.value
          if (typeof v === 'number' && typeof bv === 'number') v = v - bv
        }
        row.push(typeof v === 'number' ? Number(v.toFixed(4)) : '')
      }
      rows.push(row.join(','))
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${paramKey}_compare.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const computeStats = (series: { value: number }[]) => {
    if (!series.length) return { last: NaN, mean: NaN, min: NaN, max: NaN }
    let sum = 0, min = Number.POSITIVE_INFINITY, max = Number.NEGATIVE_INFINITY
    for (const p of series) { sum += p.value; if (p.value < min) min = p.value; if (p.value > max) max = p.value }
    return { last: series[series.length - 1].value, mean: sum / series.length, min, max }
  }
  const pearson = (a: number[], b: number[]) => {
    const n = Math.min(a.length, b.length)
    if (n === 0) return NaN
    let sa = 0, sb = 0, saa = 0, sbb = 0, sab = 0
    for (let i = 0; i < n; i++) { const x = a[i], y = b[i]; sa += x; sb += y; saa += x * x; sbb += y * y; sab += x * y }
    const cov = sab / n - (sa / n) * (sb / n)
    const va = saa / n - (sa / n) * (sa / n)
    const vb = sbb / n - (sb / n) * (sb / n)
    const den = Math.sqrt(Math.max(va, 0)) * Math.sqrt(Math.max(vb, 0))
    return den ? cov / den : NaN
  }
  const std = (arr: number[]) => {
    const n = arr.length
    if (!n) return NaN
    const m = arr.reduce((s, v) => s + v, 0) / n
    const v = arr.reduce((s, v) => s + (v - m) * (v - m), 0) / n
    return Math.sqrt(v)
  }
  type Divergence = { start: string; end: string; up: string; down: string; delta: number }
  const computeDivergences = (labels: string[], aVals: number[], bVals: number[], aName: string, bName: string): Divergence[] => {
    const n = Math.min(labels.length, aVals.length, bVals.length)
    if (n < 3) return []
    const sign = (x: number) => (x > 0 ? 1 : x < 0 ? -1 : 0)
    const res: Divergence[] = []
    let i = 0
    while (i < n - 1) {
      const sA = sign(aVals[i + 1] - aVals[i])
      const sB = sign(bVals[i + 1] - bVals[i])
      if (sA * sB === -1) {
        const start = i
        let j = i + 1
        let maxDelta = 0
        while (j < n && sign(aVals[j] - aVals[j - 1]) * sign(bVals[j] - bVals[j - 1]) === -1) {
          maxDelta = Math.max(maxDelta, Math.abs(aVals[j] - bVals[j]))
          j++
        }
        const up = sA > 0 ? aName : bName
        const down = sA > 0 ? bName : aName
        res.push({ start: labels[start], end: labels[j - 1], up, down, delta: maxDelta })
        i = j
      } else {
        i++
      }
    }
    return res.sort((x, y) => y.delta - x.delta).slice(0, 3)
  }

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
      >
        {/* Safely capture map instance once via context */}
        {mapRef && (
          <SetMapRef refObj={mapRef} />
        )}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {(() => {
          // Track placed rects and try multiple directions/offsets to avoid overlap
          const placed: { left: number; top: number; width: number; height: number }[] = []
          const mapObj = mapRef?.current
          const est = { width: 220, height: 36 }
          const gap = 18
          const intersects = (a: any, b: any) => !(a.left + a.width < b.left || b.left + b.width < a.left || a.top + a.height < b.top || b.top + b.height < a.top)
          const rectFor = (pt: L.Point, dx: number, dy: number, dir: 'top' | 'bottom' | 'left' | 'right') => {
            if (dir === 'top') return { left: pt.x - est.width / 2 + dx, top: pt.y - gap - est.height + dy, width: est.width, height: est.height }
            if (dir === 'bottom') return { left: pt.x - est.width / 2 + dx, top: pt.y + gap + dy, width: est.width, height: est.height }
            if (dir === 'right') return { left: pt.x + gap + dx, top: pt.y - est.height / 2 + dy, width: est.width, height: est.height }
            return { left: pt.x - gap - est.width + dx, top: pt.y - est.height / 2 + dy, width: est.width, height: est.height }
          }

          const directions: Array<'top' | 'right' | 'left' | 'bottom'> = ['top', 'right', 'left', 'bottom']
          const dxs = [0, 12, -12, 24, -24, 36, -36, 48, -48]
          const dys = [0, 10, -10, 20, -20, 30, -30, 40, -40]

          return locations.map(loc => {
            const sm = loc.parameters['SM'] as any
            const v = typeof sm?.latest?.value === 'number' ? sm.latest.value : 0
            const color = sm ? smColor(v) : '#941C30'

            let chosenDir: 'top' | 'bottom' | 'left' | 'right' = 'top'
            let chosenOffset: [number, number] = [0, -gap]
            if (mapObj) {
              const pt = mapObj.latLngToContainerPoint({ lat: loc.lat, lng: loc.lon } as any)
              const size = mapObj.getSize()
              const preferredByCity: Record<string, Array<'top' | 'right' | 'left' | 'bottom'>> = {
                'IISc Bangalore': ['left', 'top', 'bottom', 'right'],
                'IIT Tirupati': ['right', 'bottom', 'top', 'left'],
                'IIT Kanpur': ['top', 'right', 'left', 'bottom'],
              }
              const defaultOrder: Array<'top' | 'right' | 'left' | 'bottom'> = ['top', 'right', 'left', 'bottom']
              const directions = preferredByCity[loc.name] ?? defaultOrder
              let found = false
              for (const dir of directions) {
                for (const dx of dxs) {
                  for (const dy of dys) {
                    const rc = rectFor(pt, dx, dy, dir)
                    const within = rc.left >= 0 && rc.top >= 0 && rc.left + rc.width <= size.x && rc.top + rc.height <= size.y
                    if (!within) continue
                    if (!placed.some(p => intersects(p, rc))) {
                      placed.push(rc)
                      chosenDir = dir
                      chosenOffset = [dx, dir === 'top' ? -gap + dy : dir === 'bottom' ? gap + dy : dy]
                      found = true
                      break
                    }
                  }
                  if (found) break
                }
                if (found) break
              }
              if (!found) {
                // fallback: push a rect above
                const rc = rectFor(pt, 0, 0, 'top')
                placed.push(rc)
                chosenDir = 'top'
                chosenOffset = [0, -gap]
              }
            }

            return (
              <Marker key={loc.name} position={[loc.lat, loc.lon]} icon={createDot(color)} eventHandlers={{
                click: () => setSelected({ city: loc.name, param: 'SM' }),
              }}>
                <LeafletTooltip permanent direction={chosenDir} interactive offset={chosenOffset} opacity={1} className="mini-tooltip">
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }} onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
                    <span style={{ fontWeight: 700 }}>{loc.name}</span>
                    {typeof v === 'number' && (
                      <span style={{ fontSize: 12, color: '#333' }}>{v.toFixed(3)} m³/m³</span>
                    )}
                    <button
                      className="mini-chip"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelected({ city: loc.name, param: 'SM' })
                      }}
                      title="Open SM chart"
                      style={{ cursor: 'pointer' }}
                    >SM</button>
                    <button
                      className="mini-chip"
                      onClick={(e) => {
                        e.stopPropagation()
                        setCompareOpen(true)
                        setCompareCities(prev => prev.includes(loc.name) ? prev : [...prev, loc.name])
                      }}
                      title="Add to compare"
                      style={{ cursor: 'pointer' }}
                    >➕</button>
                  </div>
                </LeafletTooltip>
              </Marker>
            )
          })
        })()}
      </MapContainer>

      {/* Map controls moved to top-right to avoid Leaflet zoom overlap */}
      {!compareOpen && (
        <div className="absolute top-4 right-4 z-[2600] flex items-center gap-2">
          <button className="mini-chip" onClick={() => setCompareOpen(true)}>Open Compare</button>
          <button
            className="mini-chip"
            onClick={() => {
              const m = mapRef?.current
              if (!m || locations.length === 0) return
              const b = L.latLngBounds(locations.map(l => [l.lat, l.lon] as [number, number]))
              m.fitBounds(b.pad(0.25))
            }}
          >Reset View</button>
        </div>
      )}

      {/* Bottom-left legend */}
      <div className="absolute left-4 bottom-4 z-[2600] rounded-lg border bg-white/90 shadow px-3 py-2" style={{ minWidth: 220 }}>
        <div className="text-[12px] font-medium mb-1">Marker color = Soil Moisture</div>
        <div className="flex items-center gap-2">
          <div style={{ height: 10, flex: 1, background: 'linear-gradient(90deg, #e0f7e9 0%, #7ed957 35%, #2ecc40 70%, #145a32 100%)', borderRadius: 6 }} />
          <div className="text-[11px] text-muted-foreground" style={{ minWidth: 72 }}>0.0 → 0.3+</div>
        </div>
      </div>

      {/* Bottom SM timeline (visible when comparing) */}
      {compareOpen && primarySmSeries.length > 0 && (
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 16, zIndex: 2600, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(148,28,48,0.2)', borderRadius: 12, boxShadow: '0 6px 18px rgba(31,38,135,0.18)', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, minWidth: 320, maxWidth: '70vw' }}>
          <button className="mini-chip" onClick={() => setSmPlaying(p => !p)} title={smPlaying ? 'Pause' : 'Play'} style={{ padding: '6px 10px' }}>{smPlaying ? '⏸' : '▶️'}</button>
          <input type="range" min={0} max={Math.max(0, primarySmSeries.length - 1)} value={smIndex} onChange={e => setSmIndex(Number(e.target.value))} style={{ flex: 1 }} />
          <span className="mini-chip" style={{ whiteSpace: 'nowrap' }}>{primarySmSeries[smIndex]?.year}-D{primarySmSeries[smIndex]?.doy}</span>
          <select className="mini-chip" value={String(smSpeedMs)} onChange={e => setSmSpeedMs(Number(e.target.value))} title="Playback speed">
            <option value="1200">Slow</option>
            <option value="800">Normal</option>
            <option value="400">Fast</option>
          </select>
        </div>
      )}

      {/* Right-side compare panel with two charts (SM and Rainfall) */}
      {compareOpen && (
        <div className="absolute top-4 right-4 z-[2500] w-[430px] max-w-[50vw] h-[calc(100%-32px)] p-3 rounded-xl border bg-white/95 shadow-xl flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <strong className="flex-1 text-black">City Comparison</strong>
            <button className="mini-chip" onClick={() => setCompareOpen(false)}>×</button>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {compareCities.map((city, idx) => {
              const cityColor = `hsl(${Math.round((idx * 360) / Math.max(1, compareCities.length))}, 70%, 45%)`
              return (
                <span key={city} className="mini-chip" style={{ borderColor: cityColor }}>
                  <span style={{ width: 10, height: 10, borderRadius: 5, background: cityColor, display: 'inline-block' }} />
                  {city}
                  <button style={{ marginLeft: 6, background: 'transparent', border: 'none', color: '#941C30', cursor: 'pointer' }} onClick={() => setCompareCities(prev => prev.filter(c => c !== city))}>×</button>
                </span>
              )
            })}
          </div>

          <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {compareCities.length === 0 ? (
              <div className="mini-chip">Use ➕ on map labels to add cities</div>
            ) : (
              (() => {
                // Base labels from first city SM series with range/smooth applied
                const firstLoc = locations.find(l => l.name === compareCities[0])
                let baseSeries = (firstLoc?.parameters?.['SM'] as any)?.series as { year: number; doy: number; value: number }[] | undefined
                baseSeries = applyRange(baseSeries || [])
                baseSeries = options.smooth ? smoothSeries(baseSeries) : baseSeries
                const labels = (baseSeries ?? []).slice(0, Math.min(clampIndexTo(baseSeries?.length ?? 0) + 1, baseSeries?.length ?? 0)).map(d => `${d.year}-D${d.doy}`)

                // Helper to build datasets for a param key
                const buildDatasets = (paramKey: 'SM' | 'PRECTOT') => {
                  const baseLoc = options.baseline ? locations.find(l => l.name === options.baseline) : undefined
                  let baseArr = baseLoc ? applyRange(((baseLoc.parameters?.[paramKey] as any)?.series || [])) : []
                  baseArr = options.smooth ? smoothSeries(baseArr) : baseArr
                  const idxCap = clampIndexTo(baseSeries?.length ?? 0)
                  return compareCities.map((city, idx) => {
                    const loc = locations.find(l => l.name === city)
                    const param = (loc?.parameters?.[paramKey] as any)
                    if (!param?.series) return null
                    let series = applyRange(param.series as { year: number; doy: number; value: number }[])
                    if (options.smooth) series = smoothSeries(series)
                    series = series.slice(0, Math.min(idxCap + 1, series.length))
                    let data = series.map(d => d.value)
                    if (options.showDelta && options.baseline && baseArr.length) {
                      data = data.map((v, i) => {
                        const bv = baseArr[i]?.value
                        return typeof v === 'number' && typeof bv === 'number' ? v - bv : v
                      })
                    }
                    const color = `hsl(${Math.round((idx * 360) / Math.max(1, compareCities.length))}, 70%, 45%)`
                    return {
                      label: city,
                      data,
                      borderColor: color,
                      backgroundColor: `${color}20`,
                      tension: 0.25,
                      pointRadius: 0,
                      pointHoverRadius: 3,
                      fill: false,
                    }
                  }).filter(Boolean) as any[]
                }

                const smDatasets = buildDatasets('SM')
                const rainDatasets = buildDatasets('PRECTOT')

                // Shared Y ranges
                const sharedRange = (datasets: any[]) => {
                  let min = Infinity, max = -Infinity
                  datasets.forEach(ds => ds.data.forEach((v: number) => { if (Number.isFinite(v)) { if (v < min) min = v; if (v > max) max = v } }))
                  if (!Number.isFinite(min) || !Number.isFinite(max)) return undefined
                  const pad = (max - min) * 0.08
                  return { min: min - pad, max: max + pad }
                }
                const smRange = options.sharedYSm ? sharedRange(smDatasets) : undefined
                const rainRange = options.sharedYRain ? sharedRange(rainDatasets) : undefined

                return (
                  <>
                    {/* Charts first */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontWeight: 700, color: '#1E0C0D' }}>Soil Moisture</span>
                        <span style={{ fontSize: 12, color: '#941C30' }}>m³/m³</span>
                        <div className="ml-auto flex items-center gap-2">
                          <button className="mini-chip" onClick={() => exportCsv('SM')}>Export CSV</button>
                        </div>
                      </div>
                      <div style={{ height: 200 }}>
                        <Line
                          data={{ labels, datasets: smDatasets }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            animation: { duration: 300 },
                            plugins: { legend: { display: true, position: 'top', labels: { boxWidth: 12, font: { size: 11 } } } },
                            scales: {
                              x: { display: true, ticks: { maxTicksLimit: 6, font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.06)' } },
                              y: { display: true, title: { display: true, text: options.showDelta ? 'Δ m³/m³' : 'm³/m³', font: { size: 11 } }, ticks: { font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.06)' }, ...(smRange ? { min: smRange.min, max: smRange.max } : {}) },
                            },
                            interaction: { mode: 'index', intersect: false },
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontWeight: 700, color: '#1E0C0D' }}>Rainfall (Daily)</span>
                        <span style={{ fontSize: 12, color: '#941C30' }}>mm/day</span>
                        <div className="ml-auto flex items-center gap-2">
                          <button className="mini-chip" onClick={() => exportCsv('PRECTOT')}>Export CSV</button>
                        </div>
                      </div>
                      <div style={{ height: 200 }}>
                        <Line
                          data={{ labels, datasets: rainDatasets }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            animation: { duration: 300 },
                            plugins: { legend: { display: true, position: 'top', labels: { boxWidth: 12, font: { size: 11 } } } },
                            scales: {
                              x: { display: true, ticks: { maxTicksLimit: 6, font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.06)' } },
                              y: { display: true, title: { display: true, text: options.showDelta ? 'Δ mm/day' : 'mm/day', font: { size: 11 } }, ticks: { font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.06)' }, beginAtZero: !options.showDelta, ...(rainRange ? { min: rainRange.min, max: rainRange.max } : {}) },
                            },
                            interaction: { mode: 'index', intersect: false },
                          }}
                        />
                      </div>
                    </div>

                    {/* Analysis after charts */}
                    <div className="grid grid-cols-1 gap-2">
                      <div className="text-sm font-semibold">Analytics</div>
                      {compareCities.map((city, idx) => {
                        const loc = locations.find(l => l.name === city)
                        let smS = applyRange(((loc?.parameters?.['SM'] as any)?.series || []) as { year: number; doy: number; value: number }[])
                        if (options.smooth) { smS = smoothSeries(smS) }
                        const mu = smS.length ? (smS.reduce((s, p) => s + p.value, 0) / smS.length) : NaN
                        const sig = std(smS.map(p => p.value))
                        const color = `hsl(${Math.round((idx * 360) / Math.max(1, compareCities.length))}, 70%, 45%)`
                        return (
                          <div key={city} className="flex items-center justify-between rounded-lg border px-2 py-1.5">
                            <div className="flex items-center gap-2">
                              <span style={{ width: 10, height: 10, borderRadius: 5, background: color, display: 'inline-block' }} />
                              <span className="text-sm font-medium">{city}</span>
                            </div>
                            <div className="text-[12px] text-muted-foreground">
                              μ {Number.isFinite(mu) ? mu.toFixed(3) : '-'} · σ {Number.isFinite(sig) ? sig.toFixed(3) : '-'}
                            </div>
                          </div>
                        )
                      })}
                      {compareCities.length >= 2 && (() => {
                        const a = compareCities[0]
                        const b = compareCities[1]
                        const locA = locations.find(l => l.name === a)
                        const locB = locations.find(l => l.name === b)
                        let aS = applyRange(((locA?.parameters?.['SM'] as any)?.series || []) as { year: number; doy: number; value: number }[])
                        let bS = applyRange(((locB?.parameters?.['SM'] as any)?.series || []) as { year: number; doy: number; value: number }[])
                        if (options.smooth) { aS = smoothSeries(aS); bS = smoothSeries(bS) }
                        const n = Math.min(aS.length, bS.length)
                        const r = pearson(aS.slice(0, n).map(p => p.value), bS.slice(0, n).map(p => p.value))
                        const labels = baseSeries.slice(0, n).map(d => `${d.year}-D${d.doy}`)
                        const divs = computeDivergences(labels, aS.slice(0, n).map(p => p.value), bS.slice(0, n).map(p => p.value), a, b)
                        return (
                          <div className="space-y-1">
                            <div className="text-sm font-medium">Correlation</div>
                            <div className="mini-chip">{a}–{b} {Number.isFinite(r) ? r.toFixed(2) : 'NA'}</div>
                            {divs.length > 0 && (
                              <div className="space-y-1">
                                <div className="text-sm font-medium">Top divergence</div>
                                <ul className="list-disc pl-5 text-[12px]">
                                  {divs.map((d, i) => (
                                    <li key={i}>{d.start} – {d.end}: ↑ {d.up} ↓ {d.down} (Δ {d.delta.toFixed(3)}) ↦</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )
                      })()}
                    </div>

                    {/* Filters at the end */}
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <label className="mini-chip">
                        <input type="checkbox" checked={options.smooth} onChange={e => setOptions(o => ({ ...o, smooth: e.target.checked }))} />
                        <span className="ml-1">7d smooth</span>
                      </label>
                      <label className="mini-chip">
                        <input type="checkbox" checked={options.sharedYSm} onChange={e => setOptions(o => ({ ...o, sharedYSm: e.target.checked }))} />
                        <span className="ml-1">SM shared Y</span>
                      </label>
                      <label className="mini-chip">
                        <input type="checkbox" checked={options.sharedYRain} onChange={e => setOptions(o => ({ ...o, sharedYRain: e.target.checked }))} />
                        <span className="ml-1">Rain shared Y</span>
                      </label>
                      <select className="mini-chip" value={options.range} onChange={e => setOptions(o => ({ ...o, range: e.target.value as any }))}>
                        <option value="all">All Year</option>
                        <option value="H1">Jan–Jun</option>
                        <option value="MON">Monsoon (Jul–Sep)</option>
                        <option value="H2">Oct–Dec</option>
                      </select>
                      <button className="mini-chip" onClick={() => setCompareCities([])}>Clear</button>
                    </div>
                    {compareCities.length > 0 && (
                      <div className="flex items-center gap-2">
                        <select className="mini-chip" value={options.baseline} onChange={e => setOptions(o => ({ ...o, baseline: e.target.value }))}>
                          <option value="">Select baseline</option>
                          {compareCities.map(c => (<option key={c} value={c}>{c}</option>))}
                        </select>
                        <label className="mini-chip">
                          <input type="checkbox" checked={options.showDelta} onChange={e => setOptions(o => ({ ...o, showDelta: e.target.checked }))} />
                          <span className="ml-1">Show Δ vs baseline</span>
                        </label>
                      </div>
                    )}
                  </>
                )
              })()
            )}
          </div>
        </div>
      )}
      {selectedData && selectedData.param && (
        <div style={{
          position: 'absolute', left: '50%', top: 20, transform: 'translateX(-50%)',
          zIndex: 1000, width: 'min(960px, 92vw)', background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(8px)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <strong style={{ flex: 1 }}>{selectedData.loc.name} – {selectedData.param?.display}</strong>
            <button onClick={() => setSelected(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 18 }}>×</button>
          </div>
          {(() => {
            const p = selectedData.param
            if (!p || !Array.isArray(p.series)) return null
            const labels = p.series.map((d: any) => `${d.year}-D${d.doy}`)
            const data = p.series.map((d: any) => d.value)
            const isRain = selected?.param === 'PRECTOT' || selectedData.param?.unit === 'mm/day'
            return (
              <div style={{ height: 260 }}>
                <Line
                  data={{
                    labels,
                    datasets: [
                      {
                        label: `${p.display} (${p.unit || ''})`,
                        data,
                        borderColor: isRain ? '#3366cc' : '#941C30',
                        backgroundColor: isRain ? 'rgba(51,102,204,0.2)' : 'rgba(148,28,48,0.2)',
                        fill: isRain,
                        pointRadius: 0,
                        tension: 0.25,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { x: { ticks: { maxTicksLimit: 8 } }, y: { beginAtZero: isRain } },
                    interaction: { mode: 'index', intersect: false },
                  }}
                />
              </div>
            )
          })()}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              onClick={() => setSelected({ city: selectedData.loc.name, param: 'SM' })}
              className="mini-chip"
            >SM</button>
            {selectedData.loc.parameters['PRECTOT'] && (
              <button onClick={() => setSelected({ city: selectedData.loc.name, param: 'PRECTOT' })} className="mini-chip">Rainfall</button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
