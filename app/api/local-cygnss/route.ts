import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

function getDataDir() {
  return path.join(process.cwd(), 'data')
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileParam = searchParams.get('file')
    const dataDir = getDataDir()

    // If a specific file is requested, stream it for download
    if (fileParam) {
      const safeName = path.basename(fileParam)
      const filePath = path.join(dataDir, safeName)

      // Validate existence and that it's within dataDir
      if (!filePath.startsWith(dataDir)) {
        return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
      }
      if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 })
      }

      const stat = fs.statSync(filePath)
      const stream = fs.createReadStream(filePath)
      return new Response(stream as unknown as ReadableStream, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Length': String(stat.size),
          'Content-Disposition': `attachment; filename="${safeName}"`,
          'Cache-Control': 'no-store'
        }
      })
    }

    // Otherwise, list available NetCDF files
    if (!fs.existsSync(dataDir)) {
      return NextResponse.json({ files: [], note: 'Data directory not found' })
    }

    const entries = fs.readdirSync(dataDir)
    const files = entries
      .filter((name) => name.toLowerCase().endsWith('.nc'))
      .map((name) => {
        const full = path.join(dataDir, name)
        const stat = fs.statSync(full)
        return {
          name,
          sizeBytes: stat.size,
          sizeMB: +(stat.size / (1024 * 1024)).toFixed(2),
          modified: stat.mtime.toISOString(),
        }
      })
      .sort((a, b) => (a.name < b.name ? -1 : 1))

    return NextResponse.json({ files })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to read local CYGNSS files' }, { status: 500 })
  }
}
