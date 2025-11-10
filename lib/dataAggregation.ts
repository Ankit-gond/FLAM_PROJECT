// Data aggregation utilities for different time periods

import type { DataPoint, AggregatedData } from "./types"

export type AggregationPeriod = "raw" | "1min" | "5min" | "1hour"

export const AGGREGATION_INTERVALS: Record<AggregationPeriod, number> = {
  raw: 0,
  "1min": 60 * 1000,
  "5min": 5 * 60 * 1000,
  "1hour": 60 * 60 * 1000,
}

export function aggregateData(data: DataPoint[], period: AggregationPeriod): DataPoint[] {
  if (period === "raw" || data.length === 0) return data

  const interval = AGGREGATION_INTERVALS[period]
  const aggregated: Map<number, AggregatedData> = new Map()

  // Group data by time buckets
  for (const point of data) {
    const bucket = Math.floor(point.timestamp / interval) * interval

    if (!aggregated.has(bucket)) {
      aggregated.set(bucket, {
        timestamp: bucket,
        value: 0,
        count: 0,
        min: point.value,
        max: point.value,
        avg: 0,
      })
    }

    const agg = aggregated.get(bucket)!
    agg.count++
    agg.value += point.value
    agg.min = Math.min(agg.min, point.value)
    agg.max = Math.max(agg.max, point.value)
  }

  // Calculate averages
  const result: DataPoint[] = []
  aggregated.forEach((agg) => {
    agg.avg = agg.value / agg.count
    result.push({
      timestamp: agg.timestamp,
      value: agg.avg,
      category: "aggregated",
    })
  })

  return result.sort((a, b) => a.timestamp - b.timestamp)
}

export function filterDataByTimeRange(data: DataPoint[], startTime: number, endTime: number): DataPoint[] {
  return data.filter((d) => d.timestamp >= startTime && d.timestamp <= endTime)
}

export function filterDataByValueRange(data: DataPoint[], minValue: number, maxValue: number): DataPoint[] {
  return data.filter((d) => d.value >= minValue && d.value <= maxValue)
}

export function downsample(data: DataPoint[], targetCount = 1000): DataPoint[] {
  if (data.length <= targetCount) return data

  const bucketSize = Math.ceil(data.length / targetCount)
  const downsampled: DataPoint[] = []

  for (let i = 0; i < data.length; i += bucketSize) {
    const bucket = data.slice(i, i + bucketSize)
    const avgValue = bucket.reduce((sum, p) => sum + p.value, 0) / bucket.length
    const midPoint = Math.floor(i + bucketSize / 2)

    downsampled.push({
      timestamp: bucket[0].timestamp,
      value: avgValue,
      category: data[midPoint]?.category,
    })
  }

  return downsampled
}
