"use client"

// Hook for monitoring dashboard performance

import { useEffect, useState, useRef, useCallback } from "react"
import type { PerformanceMetrics } from "@/lib/types"
import { PerformanceMonitor } from "@/lib/performanceUtils"

export function usePerformanceMonitor(updateInterval = 1000) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
    memoryUsage: 0,
    lastUpdateTime: 0,
    dataPointsRendered: 0,
    renderTime: 0,
  })

  const monitorRef = useRef(new PerformanceMonitor())
  const animationRef = useRef<number | null>(null)

  const recordFrame = useCallback(() => {
    monitorRef.current.measureFrame(() => {
      // Frame measurement happens here
    })
  }, [])

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(monitorRef.current.getMetrics())
    }

    const interval = setInterval(updateMetrics, updateInterval)
    animationRef.current = window.requestAnimationFrame(() => {
      recordFrame()
      if (animationRef.current !== null) {
        window.cancelAnimationFrame(animationRef.current)
      }
    })

    return () => {
      clearInterval(interval)
      if (animationRef.current !== null) {
        window.cancelAnimationFrame(animationRef.current)
      }
    }
  }, [updateInterval, recordFrame])

  return metrics
}
