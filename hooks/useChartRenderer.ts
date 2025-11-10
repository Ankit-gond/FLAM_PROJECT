"use client"

import type React from "react"

// Hook for rendering charts with canvas

import { useRef, useCallback } from "react"
import { CanvasRenderer, createChartScale } from "@/lib/canvasUtils"
import type { ChartDimensions, DataPoint } from "@/lib/types"
import { PerformanceMonitor } from "@/lib/performanceUtils"

export function useChartRenderer(canvasRef: React.RefObject<HTMLCanvasElement>, data: DataPoint[], color = "#3b82f6") {
  const rendererRef = useRef<CanvasRenderer | null>(null)
  const performanceRef = useRef(new PerformanceMonitor())

  const getDefaultDimensions = useCallback((): ChartDimensions => {
    if (!canvasRef.current) {
      return {
        width: 800,
        height: 300,
        padding: { top: 20, right: 20, bottom: 40, left: 60 },
      }
    }

    return {
      width: canvasRef.current.offsetWidth,
      height: canvasRef.current.offsetHeight,
      padding: { top: 20, right: 20, bottom: 40, left: 60 },
    }
  }, [canvasRef])

  const renderLineChart = useCallback(
    (dimensions?: ChartDimensions) => {
      if (!canvasRef.current || data.length === 0) return

      if (!rendererRef.current) {
        rendererRef.current = new CanvasRenderer(canvasRef.current)
      }

      const dims = dimensions || getDefaultDimensions()
      const scale = createChartScale(data)
      const renderer = rendererRef.current

      renderer.clear(dims.width, dims.height)
      renderer.drawGrid(dims, scale)

      // Draw line
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

      // Draw points
      renderer.ctx.fillStyle = color
      for (let i = 0; i < data.length; i += Math.ceil(data.length / 50)) {
        const point = data[i]
        const x = renderer.scaleX(point.timestamp, scale, dims.width, dims.padding.left)
        const y = renderer.scaleY(point.value, scale, dims.height, dims.padding.top)
        renderer.drawCircle(x, y, 3, color)
      }
    },
    [data, color, canvasRef, getDefaultDimensions],
  )

  return {
    renderLineChart,
    getPerformanceMetrics: () => performanceRef.current.getMetrics(),
    clearCanvas: () => {
      if (canvasRef.current && rendererRef.current) {
        const dims = {
          width: canvasRef.current.offsetWidth,
          height: canvasRef.current.offsetHeight,
          padding: { top: 20, right: 20, bottom: 40, left: 60 },
        }
        rendererRef.current.clear(dims.width, dims.height)
      }
    },
  }
}
