"use client"

// Hook for managing real-time data streams

import { useEffect, useRef, useCallback, useState } from "react"
import type { DataPoint } from "@/lib/types"
import { DataGenerator } from "@/lib/dataGenerator"

export function useDataStream(seriesId: string, updateInterval = 100) {
  const [data, setData] = useState<DataPoint[]>([])
  const generatorRef = useRef(new DataGenerator())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastValueRef = useRef<number>(50)

  useEffect(() => {
    // Initialize with historical data
    const historicalData = generatorRef.current.generateHistoricalData(seriesId, 3600)
    setData(historicalData)
    lastValueRef.current = historicalData[historicalData.length - 1]?.value || 50
  }, [seriesId])

  const addDataPoint = useCallback((point: DataPoint) => {
    setData((prev) => {
      const newData = [...prev, point]
      // Keep only last 3600 points for memory efficiency
      if (newData.length > 3600) {
        newData.shift()
      }
      return newData
    })
    lastValueRef.current = point.value
  }, [])

  const startStreaming = useCallback(() => {
    if (intervalRef.current) return

    intervalRef.current = setInterval(() => {
      const newPoint = generatorRef.current.generateNewDataPoint(seriesId, lastValueRef.current)
      addDataPoint(newPoint)
    }, updateInterval)
  }, [seriesId, updateInterval, addDataPoint])

  const stopStreaming = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => stopStreaming()
  }, [stopStreaming])

  return {
    data,
    addDataPoint,
    startStreaming,
    stopStreaming,
    reset: () => setData([]),
  }
}
