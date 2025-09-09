"use client"

import { useRef, useEffect, useCallback } from "react"

interface DDMCanvasProps {
  data: Array<{
    delay: number
    doppler: number
    power: number
  }>
  width: number
  height: number
}

function DDMCanvas({ data, width, height }: DDMCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const drawDDM = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !data.length) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = width
    canvas.height = height
    
    // Clear canvas
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(0, 0, width, height)
    
    if (data.length === 0) {
      ctx.fillStyle = '#64748b'
      ctx.font = '16px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('No data available', width / 2, height / 2)
      return
    }

    // Find data bounds
    const delays = data.map(d => d.delay)
    const dopplers = data.map(d => d.doppler)
    const powers = data.map(d => d.power)
    
    const minDelay = Math.min(...delays)
    const maxDelay = Math.max(...delays)
    const minDoppler = Math.min(...dopplers)
    const maxDoppler = Math.max(...dopplers)
    const minPower = Math.min(...powers)
    const maxPower = Math.max(...powers)
    
    // Create image data for heatmap
    const imageData = ctx.createImageData(width, height)
    const pixelData = imageData.data
    
    // Fill with background
    for (let i = 0; i < pixelData.length; i += 4) {
      pixelData[i] = 30     // R
      pixelData[i + 1] = 41 // G
      pixelData[i + 2] = 59 // B
      pixelData[i + 3] = 255 // A
    }
    
    // Plot data points
    data.forEach(point => {
      const x = Math.floor(((point.delay - minDelay) / (maxDelay - minDelay)) * (width - 1))
      const y = Math.floor(((point.doppler - minDoppler) / (maxDoppler - minDoppler)) * (height - 1))
      
      if (x >= 0 && x < width && y >= 0 && y < height) {
        const intensity = (point.power - minPower) / (maxPower - minPower)
        const pixelIndex = (y * width + x) * 4
        
        // Color mapping: blue -> cyan -> yellow -> red
        let r, g, b
        if (intensity < 0.33) {
          // Blue to cyan
          const t = intensity / 0.33
          r = Math.floor(0 * (1 - t) + 0 * t)
          g = Math.floor(0 * (1 - t) + 255 * t)
          b = Math.floor(255 * (1 - t) + 255 * t)
        } else if (intensity < 0.66) {
          // Cyan to yellow
          const t = (intensity - 0.33) / 0.33
          r = Math.floor(0 * (1 - t) + 255 * t)
          g = Math.floor(255 * (1 - t) + 255 * t)
          b = Math.floor(255 * (1 - t) + 0 * t)
        } else {
          // Yellow to red
          const t = (intensity - 0.66) / 0.34
          r = Math.floor(255 * (1 - t) + 255 * t)
          g = Math.floor(255 * (1 - t) + 0 * t)
          b = Math.floor(0 * (1 - t) + 0 * t)
        }
        
        pixelData[pixelIndex] = r
        pixelData[pixelIndex + 1] = g
        pixelData[pixelIndex + 2] = b
        pixelData[pixelIndex + 3] = 255
      }
    })
    
    ctx.putImageData(imageData, 0, 0)
    
    // Add grid lines
    ctx.strokeStyle = '#475569'
    ctx.lineWidth = 1
    
    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * width
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    
    // Horizontal grid lines
    for (let i = 0; i <= 10; i++) {
      const y = (i / 10) * height
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
    
  }, [data, width, height])

  useEffect(() => {
    drawDDM()
  }, [drawDDM])

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-slate-600 rounded"
        style={{ width: `${width}px`, height: `${height}px` }}
      />
    </div>
  )
}

export default DDMCanvas
