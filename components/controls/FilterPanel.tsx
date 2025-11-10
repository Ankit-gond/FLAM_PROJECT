"use client"

// Filter panel for data aggregation and value filtering

import { useCallback, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { AggregationPeriod } from "@/lib/dataAggregation"

interface FilterPanelProps {
  onAggregationChange: (period: AggregationPeriod) => void
  onValueRangeChange: (min: number, max: number) => void
  onSeriesToggle?: (seriesId: string, enabled: boolean) => void
  availableSeries?: Array<{
    id: string
    label: string
    color: string
  }>
  currentAggregation?: AggregationPeriod
}

export function FilterPanel({
  onAggregationChange,
  onValueRangeChange,
  onSeriesToggle,
  availableSeries = [],
  currentAggregation = "raw",
}: FilterPanelProps) {
  const [minValue, setMinValue] = useState<number>(0)
  const [maxValue, setMaxValue] = useState<number>(100)
  const [enabledSeries, setEnabledSeries] = useState<Set<string>>(new Set(availableSeries.map((s) => s.id)))

  const handleAggregationClick = useCallback(
    (period: AggregationPeriod) => {
      onAggregationChange(period)
    },
    [onAggregationChange],
  )

  const handleValueRangeChange = useCallback(() => {
    onValueRangeChange(minValue, maxValue)
  }, [minValue, maxValue, onValueRangeChange])

  const handleSeriesToggle = useCallback(
    (seriesId: string) => {
      const newEnabled = new Set(enabledSeries)
      if (newEnabled.has(seriesId)) {
        newEnabled.delete(seriesId)
      } else {
        newEnabled.add(seriesId)
      }
      setEnabledSeries(newEnabled)
      onSeriesToggle?.(seriesId, newEnabled.has(seriesId))
    },
    [enabledSeries, onSeriesToggle],
  )

  const aggregationPeriods: AggregationPeriod[] = ["raw", "1min", "5min", "1hour"]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Aggregation Controls */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Data Aggregation</p>
          <div className="flex flex-wrap gap-2">
            {aggregationPeriods.map((period) => (
              <Button
                key={period}
                onClick={() => handleAggregationClick(period)}
                variant={currentAggregation === period ? "default" : "outline"}
                size="sm"
                className="text-xs"
              >
                {period === "raw" ? "Raw" : period}
              </Button>
            ))}
          </div>
        </div>

        {/* Value Range Filter */}
        <div className="border-t pt-4">
          <p className="text-xs font-medium text-muted-foreground mb-3">Value Range</p>
          <div className="space-y-2">
            <div className="flex gap-2 items-center">
              <label className="text-xs text-muted-foreground min-w-8">Min:</label>
              <input
                type="number"
                value={minValue}
                onChange={(e) => setMinValue(Number(e.target.value))}
                className="flex-1 px-2 py-1 border border-border rounded text-sm bg-background"
              />
            </div>
            <div className="flex gap-2 items-center">
              <label className="text-xs text-muted-foreground min-w-8">Max:</label>
              <input
                type="number"
                value={maxValue}
                onChange={(e) => setMaxValue(Number(e.target.value))}
                className="flex-1 px-2 py-1 border border-border rounded text-sm bg-background"
              />
            </div>
            <Button onClick={handleValueRangeChange} variant="default" size="sm" className="w-full text-xs">
              Apply Filter
            </Button>
          </div>
        </div>

        {/* Series Toggle */}
        {availableSeries.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Series</p>
            <div className="space-y-2">
              {availableSeries.map((series) => (
                <label key={series.id} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={enabledSeries.has(series.id)}
                    onChange={() => handleSeriesToggle(series.id)}
                    className="rounded w-4 h-4"
                  />
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: series.color }} />
                  <span>{series.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
