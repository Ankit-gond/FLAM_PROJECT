"use client"

// Main dashboard page with all charts and controls

import { useEffect, useState, useRef, useCallback } from "react"
import { LineChart } from "@/components/charts/LineChart"
import { BarChart } from "@/components/charts/BarChart"
import { ScatterPlot } from "@/components/charts/ScatterPlot"
import { Heatmap } from "@/components/charts/Heatmap"
import { DataTable } from "@/components/ui/DataTable"
import { PerformanceMonitor } from "@/components/ui/PerformanceMonitor"
import { TimeRangeSelector } from "@/components/controls/TimeRangeSelector"
import { FilterPanel } from "@/components/controls/FilterPanel"
import { ZoomPanControls } from "@/components/controls/ZoomPanControls"
import { DataProvider, useDataContext } from "@/components/providers/DataProvider"
import type { DataPoint } from "@/lib/types"

function DashboardContent() {
  const { filteredSeries, filters, setTimeRange, setAggregation, setValueRange, toggleSeriesVisibility, addDataPoint } =
    useDataContext()

  const [zoomLevel, setZoomLevel] = useState(1)
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [combinedData, setCombinedData] = useState<DataPoint[]>([])

  // Combine all series data for the table
  useEffect(() => {
    const combined: DataPoint[] = []
    for (const series of filteredSeries.values()) {
      combined.push(...series.data)
    }
    combined.sort((a, b) => b.timestamp - a.timestamp)
    setCombinedData(combined)
  }, [filteredSeries])

  // Simulate real-time data streaming
  useEffect(() => {
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current)

    streamIntervalRef.current = setInterval(() => {
      for (const seriesId of filteredSeries.keys()) {
        const randomValue = 50 + (Math.random() - 0.5) * 30
        addDataPoint(seriesId, Math.max(0, Math.min(100, randomValue)))
      }
    }, 100)

    return () => {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current)
      }
    }
  }, [filteredSeries, addDataPoint])

  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 3))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 1))
  }, [])

  const handleReset = useCallback(() => {
    setZoomLevel(1)
    setTimeRange(Date.now() - 60 * 60 * 1000, Date.now())
  }, [setTimeRange])

  const getSeriesInfo = () => {
    return Array.from(filteredSeries.values()).map((series) => ({
      id: series.id,
      label: series.label,
      color: series.color,
    }))
  }

  // Get first series or empty array
  const firstSeriesData = Array.from(filteredSeries.values())[0]?.data || []
  const secondSeriesData = Array.from(filteredSeries.values())[1]?.data || []
  const thirdSeriesData = Array.from(filteredSeries.values())[2]?.data || []

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-foreground">Performance Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time analytics with 10,000+ data points at 60fps</p>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Charts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Line Chart */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Series 1 - Line Chart</h2>
            <LineChart data={firstSeriesData} color="#3b82f6" label="Series 1" height={300} showGrid />
          </div>

          {/* Bar Chart */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Series 2 - Bar Chart</h2>
            <BarChart data={secondSeriesData} color="#10b981" label="Series 2" height={300} showGrid />
          </div>

          {/* Scatter Plot */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Series 3 - Scatter Plot</h2>
            <ScatterPlot data={thirdSeriesData} color="#f59e0b" label="Series 3" height={300} showGrid />
          </div>

          {/* Heatmap */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Aggregated - Heatmap</h2>
            <Heatmap data={combinedData} label="Combined Data" height={300} colorScale="viridis" />
          </div>
        </div>

        {/* Controls and monitoring row */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          <TimeRangeSelector onRangeChange={setTimeRange} />
          <FilterPanel
            onAggregationChange={setAggregation}
            onValueRangeChange={setValueRange}
            onSeriesToggle={toggleSeriesVisibility}
            availableSeries={getSeriesInfo()}
            currentAggregation={filters.aggregationPeriod}
          />
          <ZoomPanControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onPanLeft={() => {}}
            onPanRight={() => {}}
            onReset={handleReset}
            zoomLevel={zoomLevel}
          />
          <PerformanceMonitor updateInterval={500} />
        </div>

        {/* Data Table */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Raw Data Points</h2>
          <DataTable
            data={combinedData}
            title="Data Stream"
            height={400}
            itemHeight={32}
            sortBy="timestamp"
            sortOrder="desc"
          />
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <DataProvider>
      <DashboardContent />
    </DataProvider>
  )
}
