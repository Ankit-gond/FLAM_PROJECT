// High-performance data generator for realistic time-series data

import type { DataPoint, TimeSeries } from "./types"

export class DataGenerator {
  private baseTime: number
  private trends: Map<string, { slope: number; noise: number }>

  constructor() {
    this.baseTime = Date.now() - 60 * 60 * 1000 // Start 1 hour ago
    this.trends = new Map()
  }

  generateHistoricalData(seriesId: string, count = 3600): DataPoint[] {
    const data: DataPoint[] = []
    const trendKey = `trend_${seriesId}`

    if (!this.trends.has(trendKey)) {
      this.trends.set(trendKey, {
        slope: Math.random() * 0.01 - 0.005,
        noise: Math.random() * 0.5 + 0.3,
      })
    }

    const trend = this.trends.get(trendKey)!
    let value = 50 + Math.random() * 20

    for (let i = 0; i < count; i++) {
      const timestamp = this.baseTime + i * 1000 // 1 second intervals

      // Apply trend and noise
      value += trend.slope + (Math.random() - 0.5) * trend.noise
      value = Math.max(0, Math.min(100, value)) // Clamp between 0-100

      // Add occasional spikes
      if (Math.random() < 0.02) {
        value += (Math.random() - 0.5) * 20
      }

      data.push({
        timestamp,
        value: Math.round(value * 100) / 100,
        category: `cat_${Math.floor(Math.random() * 3)}`,
      })
    }

    return data
  }

  generateNewDataPoint(seriesId: string, lastValue: number): DataPoint {
    const trendKey = `trend_${seriesId}`
    const trend = this.trends.get(trendKey) || {
      slope: Math.random() * 0.01 - 0.005,
      noise: Math.random() * 0.5 + 0.3,
    }

    let newValue = lastValue + trend.slope + (Math.random() - 0.5) * trend.noise
    newValue = Math.max(0, Math.min(100, newValue))

    return {
      timestamp: Date.now(),
      value: Math.round(newValue * 100) / 100,
      category: `cat_${Math.floor(Math.random() * 3)}`,
    }
  }

  createTimeSeries(id: string, label: string, color: string, type: "line" | "bar" | "area" = "line"): TimeSeries {
    return {
      id,
      label,
      color,
      type,
      data: this.generateHistoricalData(id, 3600),
    }
  }
}

export const generateMultipleSeries = (count = 4): TimeSeries[] => {
  const generator = new DataGenerator()
  const colors = [
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // purple
  ]

  const series: TimeSeries[] = []
  for (let i = 0; i < count; i++) {
    series.push(
      generator.createTimeSeries(
        `series_${i}`,
        `Series ${i + 1}`,
        colors[i % colors.length],
        i % 3 === 0 ? "bar" : "line",
      ),
    )
  }

  return series
}
