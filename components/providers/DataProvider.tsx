"use client"

// Context provider for managing dashboard state

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import type { TimeSeries, FilterState } from "@/lib/types"
import { generateMultipleSeries } from "@/lib/dataGenerator"
import {
  aggregateData,
  type AggregationPeriod,
  filterDataByTimeRange,
  filterDataByValueRange,
} from "@/lib/dataAggregation"

interface DataContextType {
  allSeries: Map<string, TimeSeries>
  filteredSeries: Map<string, TimeSeries>
  filters: FilterState
  setTimeRange: (start: number, end: number) => void
  setAggregation: (period: AggregationPeriod) => void
  setValueRange: (min: number, max: number) => void
  toggleSeriesVisibility: (seriesId: string, visible: boolean) => void
  addDataPoint: (seriesId: string, value: number) => void
  refreshFilters: () => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [allSeries, setAllSeries] = useState<Map<string, TimeSeries>>(() => {
    const series = generateMultipleSeries(4)
    return new Map(series.map((s) => [s.id, s]))
  })

  const [filters, setFilters] = useState<FilterState>({
    startTime: Date.now() - 60 * 60 * 1000,
    endTime: Date.now(),
    selectedCategories: [],
    minValue: 0,
    maxValue: 100,
    aggregationPeriod: "raw",
  })

  const [visibleSeries, setVisibleSeries] = useState<Set<string>>(new Set(allSeries.keys()))

  const [filteredSeries, setFilteredSeries] = useState<Map<string, TimeSeries>>(allSeries)

  const applyFilters = useCallback(() => {
    const filtered = new Map<string, TimeSeries>()

    for (const [id, series] of allSeries) {
      if (!visibleSeries.has(id)) continue

      let data = [...series.data]

      // Apply time range filter
      data = filterDataByTimeRange(data, filters.startTime, filters.endTime)

      // Apply aggregation
      if (filters.aggregationPeriod !== "raw") {
        data = aggregateData(data, filters.aggregationPeriod)
      }

      // Apply value range filter
      data = filterDataByValueRange(data, filters.minValue, filters.maxValue)

      filtered.set(id, { ...series, data })
    }

    setFilteredSeries(filtered)
  }, [allSeries, visibleSeries, filters])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  const setTimeRange = useCallback((start: number, end: number) => {
    setFilters((prev) => ({ ...prev, startTime: start, endTime: end }))
  }, [])

  const setAggregation = useCallback((period: AggregationPeriod) => {
    setFilters((prev) => ({ ...prev, aggregationPeriod: period }))
  }, [])

  const setValueRange = useCallback((min: number, max: number) => {
    setFilters((prev) => ({ ...prev, minValue: min, maxValue: max }))
  }, [])

  const toggleSeriesVisibility = useCallback((seriesId: string, visible: boolean) => {
    setVisibleSeries((prev) => {
      const newSet = new Set(prev)
      if (visible) {
        newSet.add(seriesId)
      } else {
        newSet.delete(seriesId)
      }
      return newSet
    })
  }, [])

  const addDataPoint = useCallback((seriesId: string, value: number) => {
    setAllSeries((prev) => {
      const newSeries = new Map(prev)
      const series = newSeries.get(seriesId)
      if (series) {
        const newData = [
          ...series.data,
          {
            timestamp: Date.now(),
            value,
            category: `cat_${Math.floor(Math.random() * 3)}`,
          },
        ]
        if (newData.length > 3600) {
          newData.shift()
        }
        newSeries.set(seriesId, { ...series, data: newData })
      }
      return newSeries
    })
  }, [])

  const refreshFilters = useCallback(() => {
    applyFilters()
  }, [applyFilters])

  const value: DataContextType = {
    allSeries,
    filteredSeries,
    filters,
    setTimeRange,
    setAggregation,
    setValueRange,
    toggleSeriesVisibility,
    addDataPoint,
    refreshFilters,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useDataContext() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useDataContext must be used within DataProvider")
  }
  return context
}
