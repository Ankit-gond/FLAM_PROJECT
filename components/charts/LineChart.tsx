"use client"

// High-performance line chart using canvas rendering

import { useEffect, useRef, useState, useCallback } from "react"
import type { DataPoint, ChartDimensions } from "@/lib/types"
import { CanvasRenderer, createChartScale } from "@/lib/canvasUtils"
import { PerformanceMonitor } from "@/lib/performanceUtils"

interface LineChartProps {
  data: DataPoint[]
  color?: string
  label?: string
  height?: number
  showPoints?: boolean
  showGrid?: boolean
}

export function LineChart({
  data,
  color = "#3b82f6",
  label = "Series",
  height = 300,
  showPoints = false,
  showGrid = true,
}: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<CanvasRenderer | null>(null)
  const performanceRef = useRef(new PerformanceMonitor())
  const [dimensions, setDimensions] = useState<ChartDimensions>({
    width: 800,
    height,
    padding: { top: 20, right: 20, bottom: 40, left: 60 },
  })

  const getChartDimensions = useCallback((): ChartDimensions => {
    if (!containerRef.current) return dimensions

    return {
      width: containerRef.current.offsetWidth,
      height,
      padding: { top: 20, right: 20, bottom: 40, left: 60 },
    }
  }, [height, dimensions])

  const render = useCallback(() => {
    if (!canvasRef.current || data.length === 0) return

    if (!rendererRef.current) {
      rendererRef.current = new CanvasRenderer(canvasRef.current)
    }

    const dims = getChartDimensions()
    const scale = createChartScale(data)
    const renderer = rendererRef.current

    performanceRef.current.measureFrame(() => {
      // Clear canvas
      renderer.clear(dims.width, dims.height)

      // Draw grid
      if (showGrid) {
        renderer.drawGrid(dims, scale)
      }

      // Draw axes
      renderer.drawLine(
        dims.padding.left,
        dims.height - dims.padding.bottom,
        dims.width - dims.padding.right,
        dims.height - dims.padding.bottom,
        "#d1d5db",
        1,
      )
      renderer.drawLine(
        dims.padding.left,
        dims.padding.top,
        dims.padding.left,
        dims.height - dims.padding.bottom,
        "#d1d5db",
        1,
      )

      // Draw line chart
      renderer.ctx.strokeStyle = color
      renderer.ctx.lineWidth = 2
      renderer.ctx.lineCap = "round"
      renderer.ctx.lineJoin = "round"
      renderer.ctx.beginPath()

      let isFirstPoint = true
      for (const point of data) {
        const x = renderer.scaleX(point.timestamp, scale, dims.width, dims.padding.left)
        const y = renderer.scaleY(point.value, scale, dims.height, dims.padding.top)

        if (isFirstPoint) {
          renderer.ctx.moveTo(x, y)
          isFirstPoint = false
        } else {
          renderer.ctx.lineTo(x, y)
        }
      }

      renderer.ctx.stroke()

      // Draw points if enabled
      if (showPoints) {
        const pointSpacing = Math.max(1, Math.floor(data.length / 50))
        renderer.ctx.fillStyle = color
        for (let i = 0; i < data.length; i += pointSpacing) {
          const point = data[i]
          const x = renderer.scaleX(point.timestamp, scale, dims.width, dims.padding.left)
          const y = renderer.scaleY(point.value, scale, dims.height, dims.padding.top)
          renderer.drawCircle(x, y, 3, color)
        }
      }

      // Draw labels
      renderer.drawText(label, dims.padding.left, dims.padding.top - 10, "#6b7280", "12px sans-serif", "left")
    })
  }, [data, color, label, showPoints, showGrid, getChartDimensions])

  useEffect(() => {
    render()
  }, [render])

  useEffect(() => {
    const handleResize = () => {
      setDimensions(getChartDimensions())
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [getChartDimensions])

  return (
    <div ref={containerRef} className="w-full">
      <canvas ref={canvasRef} className="w-full border border-border rounded-lg bg-background" style={{ height }} />
    </div>
  )
}
