"use client"

// Real-time performance monitoring display

import React, { useEffect, useState } from "react"
import type { PerformanceMetrics } from "@/lib/types"
import { PerformanceMonitor as PerfMonitor } from "@/lib/performanceUtils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PerformanceMonitorProps {
  updateInterval?: number
}

export function PerformanceMonitor({ updateInterval = 1000 }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
    memoryUsage: 0,
    lastUpdateTime: 0,
    dataPointsRendered: 0,
    renderTime: 0,
  })

  const monitorRef = React.useRef<PerfMonitor>(new PerfMonitor())

  useEffect(() => {
    let animationId: number
    let updateTimer: NodeJS.Timeout

    const recordFrame = () => {
      monitorRef.current.measureFrame(() => {})
      animationId = requestAnimationFrame(recordFrame)
    }

    const updateMetrics = () => {
      setMetrics(monitorRef.current.getMetrics())
    }

    recordFrame()
    updateTimer = setInterval(updateMetrics, updateInterval)

    return () => {
      cancelAnimationFrame(animationId)
      clearInterval(updateTimer)
    }
  }, [updateInterval])

  const getMetricColor = (metric: string, value: number): string => {
    if (metric === "fps") {
      if (value >= 55) return "text-green-600"
      if (value >= 30) return "text-yellow-600"
      return "text-red-600"
    }
    if (metric === "frameTime") {
      if (value <= 16.67) return "text-green-600"
      if (value <= 33.33) return "text-yellow-600"
      return "text-red-600"
    }
    if (metric === "memory") {
      if (value <= 50) return "text-green-600"
      if (value <= 80) return "text-yellow-600"
      return "text-red-600"
    }
    return "text-foreground"
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base">Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* FPS */}
          <div className="p-3 rounded-lg bg-muted">
            <p className="text-xs text-muted-foreground mb-1">FPS</p>
            <p className={`text-lg font-bold ${getMetricColor("fps", metrics.fps)}`}>{metrics.fps.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">target: 60</p>
          </div>

          {/* Frame Time */}
          <div className="p-3 rounded-lg bg-muted">
            <p className="text-xs text-muted-foreground mb-1">Frame Time</p>
            <p className={`text-lg font-bold ${getMetricColor("frameTime", metrics.frameTime)}`}>
              {metrics.frameTime.toFixed(1)}ms
            </p>
            <p className="text-xs text-muted-foreground">target: 16.7ms</p>
          </div>

          {/* Memory Usage */}
          <div className="p-3 rounded-lg bg-muted">
            <p className="text-xs text-muted-foreground mb-1">Memory</p>
            <p className={`text-lg font-bold ${getMetricColor("memory", metrics.memoryUsage)}`}>
              {metrics.memoryUsage}%
            </p>
            <p className="text-xs text-muted-foreground">of heap</p>
          </div>

          {/* Last Update */}
          <div className="p-3 rounded-lg bg-muted">
            <p className="text-xs text-muted-foreground mb-1">Status</p>
            <p className="text-lg font-bold text-green-600">Active</p>
            <p className="text-xs text-muted-foreground">{metrics.lastUpdateTime > 0 ? "Streaming" : "Idle"}</p>
          </div>
        </div>

        {/* Performance indicators */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Response Time</span>
            <span className={`${metrics.frameTime < 100 ? "text-green-600" : "text-yellow-600"}`}>
              {metrics.frameTime < 100 ? "✓ Excellent" : "⚠ Good"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Data Points Rendering</span>
            <span className="text-foreground font-mono">{metrics.dataPointsRendered}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Render Time</span>
            <span className="text-foreground font-mono">{metrics.renderTime.toFixed(1)}ms</span>
          </div>
        </div>

        {/* Performance warning */}
        {metrics.fps < 30 && (
          <div className="mt-4 p-2 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-800 dark:text-yellow-200">
            Performance issue detected. Try reducing data points or aggregation level.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
