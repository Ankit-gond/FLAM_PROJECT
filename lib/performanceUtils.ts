// Performance monitoring and optimization utilities

import type { PerformanceMetrics } from "./types"

export class PerformanceMonitor {
  private frameCount = 0
  private lastFrameTime = 0
  private frameTimings: number[] = []
  private maxFrameTimings = 60

  measureFrame(callback: () => void): number {
    const start = performance.now()
    callback()
    const end = performance.now()
    const frameTime = end - start

    this.frameTimings.push(frameTime)
    if (this.frameTimings.length > this.maxFrameTimings) {
      this.frameTimings.shift()
    }

    return frameTime
  }

  getFPS(): number {
    if (this.frameTimings.length === 0) return 0
    const avgFrameTime = this.frameTimings.reduce((a, b) => a + b) / this.frameTimings.length
    return Math.round(1000 / avgFrameTime)
  }

  getAverageFrameTime(): number {
    if (this.frameTimings.length === 0) return 0
    return this.frameTimings.reduce((a, b) => a + b) / this.frameTimings.length
  }

  getMetrics(): PerformanceMetrics {
    return {
      fps: this.getFPS(),
      frameTime: this.getAverageFrameTime(),
      memoryUsage: this.getMemoryUsage(),
      lastUpdateTime: Date.now(),
      dataPointsRendered: 0,
      renderTime: 0,
    }
  }

  private getMemoryUsage(): number {
    if (typeof window !== "undefined" && (performance as any).memory) {
      return Math.round(
        ((performance as any).memory.usedJSHeapSize / (performance as any).memory.jsHeapSizeLimit) * 100,
      )
    }
    return 0
  }

  reset(): void {
    this.frameTimings = []
  }
}

// Request animation frame with performance tracking
export const requestAnimationFrameWithTiming = (callback: (deltaTime: number) => void): number => {
  let lastTime = Date.now()

  const animate = () => {
    const currentTime = Date.now()
    const deltaTime = currentTime - lastTime
    lastTime = currentTime

    callback(deltaTime)
    return requestAnimationFrame(animate)
  }

  return requestAnimationFrame(animate)
}

// Throttle function calls to maintain target FPS
export const createThrottle = (targetFPS = 60) => {
  const frameTime = 1000 / targetFPS
  let lastCallTime = 0

  return (callback: () => void) => {
    const now = Date.now()
    if (now - lastCallTime >= frameTime) {
      lastCallTime = now
      callback()
      return true
    }
    return false
  }
}

// Batch operations to reduce layout thrashing
export const batchUpdates = async (operations: Array<() => void>) => {
  // Read phase
  const reads = operations.filter((_, i) => i % 2 === 0)
  reads.forEach((op) => op())

  // Wait for paint
  await new Promise((resolve) => requestAnimationFrame(resolve))

  // Write phase
  const writes = operations.filter((_, i) => i % 2 === 1)
  writes.forEach((op) => op())
}
