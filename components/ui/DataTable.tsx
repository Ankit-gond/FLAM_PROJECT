"use client"

// Virtual scrolling data table for efficient rendering of large datasets

import React, { useMemo } from "react"
import type { DataPoint } from "@/lib/types"
import { useVirtualization } from "@/hooks/useVirtualization"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DataTableProps {
  data: DataPoint[]
  title?: string
  height?: number
  itemHeight?: number
  sortBy?: "timestamp" | "value"
  sortOrder?: "asc" | "desc"
}

export function DataTable({
  data,
  title = "Data Points",
  height = 400,
  itemHeight = 32,
  sortBy = "timestamp",
  sortOrder = "desc",
}: DataTableProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Sort data
  const sortedData = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      const aVal = sortBy === "timestamp" ? a.timestamp : a.value
      const bVal = sortBy === "timestamp" ? b.timestamp : b.value
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal
    })
    return sorted
  }, [data, sortBy, sortOrder])

  // Virtual scrolling
  const { visibleRange, visibleItems, handleScroll, totalHeight, offsetY } = useVirtualization(sortedData, {
    itemHeight,
    containerHeight: height,
    overscan: 5,
  })

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const formatValue = (value: number) => {
    return value.toFixed(2)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Showing {visibleRange.end - visibleRange.start} of {data.length} points
        </p>
      </CardHeader>
      <CardContent>
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="border border-border rounded-lg overflow-y-auto bg-background"
          style={{ height }}
        >
          {/* Spacer before visible items */}
          <div style={{ height: offsetY }} />

          {/* Visible items */}
          <div className="divide-y divide-border">
            {/* Header */}
            {visibleRange.start === 0 && (
              <div className="sticky top-0 grid grid-cols-3 gap-4 px-4 py-2 bg-muted text-muted-foreground font-medium text-xs">
                <div>Timestamp</div>
                <div className="text-right">Value</div>
                <div>Category</div>
              </div>
            )}

            {/* Data rows */}
            {visibleItems.map((item, index) => {
              const absoluteIndex = visibleRange.start + index
              const isEven = absoluteIndex % 2 === 0

              return (
                <div
                  key={`${item.timestamp}-${index}`}
                  className={`grid grid-cols-3 gap-4 px-4 py-2 text-sm ${
                    isEven ? "bg-background" : "bg-muted/30"
                  } hover:bg-muted/60 transition-colors`}
                  style={{ minHeight: itemHeight }}
                >
                  <div className="text-foreground text-xs">{formatTimestamp(item.timestamp)}</div>
                  <div className="text-right text-foreground font-mono text-xs">{formatValue(item.value)}</div>
                  <div className="text-muted-foreground text-xs">{item.category || "—"}</div>
                </div>
              )
            })}
          </div>

          {/* Empty state */}
          {data.length === 0 && (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              No data available
            </div>
          )}
        </div>

        {/* Statistics footer */}
        {data.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4 text-xs text-muted-foreground">
            <div>
              <p className="font-medium">Count</p>
              <p className="text-foreground">{data.length}</p>
            </div>
            <div>
              <p className="font-medium">Avg Value</p>
              <p className="text-foreground">{(data.reduce((sum, p) => sum + p.value, 0) / data.length).toFixed(2)}</p>
            </div>
            <div>
              <p className="font-medium">Value Range</p>
              <p className="text-foreground">
                {Math.min(...data.map((p) => p.value)).toFixed(2)} - {Math.max(...data.map((p) => p.value)).toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
