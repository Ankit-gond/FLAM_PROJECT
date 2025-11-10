"use client"

// High-performance bar chart using canvas rendering

import { useEffect, useRef, useState, useCallback } from "react"
import type { DataPoint, ChartDimensions } from "@/lib/types"
import { CanvasRenderer, createChartScale } from "@/lib/canvasUtils"
import { PerformanceMonitor } from "@/lib/performanceUtils"
import { downsample } from "@/lib/dataAggregation"

interface BarChartProps {
  data: DataPoint[]
  color?: string
  label?: string
  height?: number
  showGrid?: boolean
  barGap?: number
}

export function BarChart({
  data,
  color = "#10b981",
  label = "Series",
  height = 300,
  showGrid = true,
  barGap = 2,
}: BarChartProps) {
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
    const downsampledData = downsample(data, 100) // Limit bars for performance
    const scale = createChartScale(downsampledData)
    const renderer = rendererRef.current

    performanceRef.current.measureFrame(() => {
      renderer.clear(dims.width, dims.height)

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

      // Draw bars
      const barWidth = (dims.width - dims.padding.left - dims.padding.right) / downsampledData.length - barGap

      for (let i = 0; i < downsampledData.length; i++) {
        const point = downsampledData[i]
        const x = renderer.scaleX(point.timestamp, scale, dims.width, dims.padding.left)
        const y = renderer.scaleY(point.value, scale, dims.height, dims.padding.top)
        const barHeight = dims.height - dims.padding.bottom - y

        renderer.drawRect(x - barWidth / 2, y, barWidth, barHeight, color, undefined)
      }

      // Draw label
      renderer.drawText(label, dims.padding.left, dims.padding.top - 10, "#6b7280", "12px sans-serif", "left")
    })
  }, [data, color, label, showGrid, barGap, getChartDimensions])

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
