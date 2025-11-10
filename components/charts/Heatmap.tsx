"use client"

// High-performance heatmap using canvas rendering

import { useEffect, useRef, useState, useCallback } from "react"
import type { DataPoint, ChartDimensions } from "@/lib/types"
import { CanvasRenderer, createChartScale } from "@/lib/canvasUtils"
import { PerformanceMonitor } from "@/lib/performanceUtils"
import { downsample } from "@/lib/dataAggregation"

interface HeatmapProps {
  data: DataPoint[]
  label?: string
  height?: number
  cellSize?: number
  colorScale?: "viridis" | "plasma" | "cool"
}

function getHeatmapColor(
  value: number,
  min: number,
  max: number,
  scale: "viridis" | "plasma" | "cool" = "viridis",
): string {
  const normalized = (value - min) / (max - min)

  if (scale === "viridis") {
    if (normalized < 0.25)
      return `rgb(${Math.round(63 + normalized * 200)}, ${Math.round(7 + normalized * 100)}, ${Math.round(131 - normalized * 50)})`
    if (normalized < 0.5)
      return `rgb(${Math.round(33 - normalized * 100)}, ${Math.round(145 + normalized * 100)}, ${Math.round(140 + normalized * 50)})`
    if (normalized < 0.75)
      return `rgb(${Math.round(103 + normalized * 100)}, ${Math.round(213 + normalized * 30)}, ${Math.round(61 - normalized * 50)})`
    return `rgb(${Math.round(253 - normalized * 50)}, ${Math.round(231 + normalized * 20)}, ${Math.round(37 - normalized * 30)})`
  }

  if (scale === "cool") {
    return `rgb(${Math.round(0 + normalized * 255)}, ${Math.round(255 - normalized * 127)}, 255)`
  }

  // plasma
  return `rgb(${Math.round(13 + normalized * 242)}, ${Math.round(8 + normalized * 247)}, ${Math.round(135 - normalized * 135)})`
}

export function Heatmap({ data, label = "Heatmap", height = 300, cellSize = 8, colorScale = "viridis" }: HeatmapProps) {
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
    const downsampledData = downsample(data, 200)
    const scale = createChartScale(downsampledData)
    const renderer = rendererRef.current

    const values = downsampledData.map((d) => d.value)
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)

    performanceRef.current.measureFrame(() => {
      renderer.clear(dims.width, dims.height)

      // Draw heatmap cells
      const chartWidth = dims.width - dims.padding.left - dims.padding.right
      const chartHeight = dims.height - dims.padding.top - dims.padding.bottom
      const cellsPerRow = Math.floor(chartWidth / cellSize)

      for (let i = 0; i < downsampledData.length; i++) {
        const point = downsampledData[i]
        const row = Math.floor(i / cellsPerRow)
        const col = i % cellsPerRow

        const x = dims.padding.left + col * cellSize
        const y = dims.padding.top + row * cellSize

        const color = getHeatmapColor(point.value, minValue, maxValue, colorScale)
        renderer.drawRect(x, y, cellSize, cellSize, color)
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

      // Draw label
      renderer.drawText(label, dims.padding.left, dims.padding.top - 10, "#6b7280", "12px sans-serif", "left")
    })
  }, [data, label, cellSize, colorScale, getChartDimensions])

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
