"use client"

// Hook for virtual scrolling of large datasets

import { useEffect, useState, useRef, useCallback } from "react"

interface VirtualScrollOptions {
  itemHeight: number
  containerHeight: number
  overscan?: number
}

interface VirtualRange {
  start: number
  end: number
  visibleStart: number
  visibleEnd: number
}

export function useVirtualization<T>(items: T[], options: VirtualScrollOptions) {
  const [scrollOffset, setScrollOffset] = useState(0)
  const [visibleRange, setVisibleRange] = useState<VirtualRange>({
    start: 0,
    end: 0,
    visibleStart: 0,
    visibleEnd: 0,
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const overscan = options.overscan || 5

  const updateVisibleRange = useCallback(() => {
    const visibleCount = Math.ceil(options.containerHeight / options.itemHeight)
    const visibleStart = Math.max(0, Math.floor(scrollOffset / options.itemHeight) - overscan)
    const visibleEnd = Math.min(items.length, visibleStart + visibleCount + overscan * 2)

    setVisibleRange({
      start: visibleStart,
      end: visibleEnd,
      visibleStart,
      visibleEnd,
    })
  }, [scrollOffset, items.length, options.containerHeight, options.itemHeight, overscan])

  useEffect(() => {
    updateVisibleRange()
  }, [updateVisibleRange])

  const handleScroll = useCallback((e: Event) => {
    const target = e.target as HTMLDivElement
    setScrollOffset(target.scrollTop)
  }, [])

  return {
    visibleRange,
    visibleItems: items.slice(visibleRange.start, visibleRange.end),
    handleScroll,
    containerRef,
    totalHeight: items.length * options.itemHeight,
    offsetY: visibleRange.start * options.itemHeight,
  }
}
