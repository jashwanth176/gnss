export type SeriesPoint = { year: number; doy: number; value: number }

function computeDoy(d: Date) {
  const start = new Date(d.getFullYear(), 0, 0)
  const diff = d.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

export async function fetchCsvSeries(url: string, valueColumn?: string, multiplier = 1): Promise<SeriesPoint[]> {
  const res = await fetch(url)
  if (!res.ok) return []
  const text = await res.text()
  const lines = text.split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return []
  const header = lines[0].split(',').map(h => h.trim().toLowerCase())

  // Value column
  let idxVal = -1
  if (valueColumn) idxVal = header.indexOf(valueColumn.toLowerCase())
  if (idxVal === -1) {
    const common = ['value', 'sm', 'sm_swvl1', 'prectot']
    idxVal = common.map(c => header.indexOf(c)).find(i => i >= 0) ?? -1
  }
  if (idxVal < 0) return []

  // Time columns: prefer year+doy if present, else 'valid_time'/'date'
  const idxYear = header.indexOf('year')
  const idxDoy = header.indexOf('doy')
  const idxValidTime = header.indexOf('valid_time')
  const idxDate = header.indexOf('date')

  const out: SeriesPoint[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',')
    if (cols.length === 0) continue

    let year: number | null = null
    let doy: number | null = null

    if (idxYear >= 0 && idxDoy >= 0) {
      // Explicit year/doy
      year = Number(cols[idxYear])
      doy = Number(cols[idxDoy])
    } else {
      // Parse date-like column
      const dateStr = idxValidTime >= 0 ? cols[idxValidTime] : (idxDate >= 0 ? cols[idxDate] : null)
      if (dateStr) {
        const d = new Date(dateStr)
        if (!isNaN(d.getTime())) {
          year = d.getFullYear()
          doy = computeDoy(d)
        }
      }
    }

    const v = Number(cols[idxVal]) * multiplier
    if (year != null && doy != null && Number.isFinite(v)) {
      out.push({ year, doy, value: v })
    }
  }
  return out
}
