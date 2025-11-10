// Core types for the performance dashboard

export interface DataPoint {
  timestamp: number
  value: number
  category?: string
  metadata?: Record<string, any>
}

export interface TimeSeries {
  id: string
  label: string
  data: DataPoint[]
  color: string
  type: "line" | "bar" | "area"
}

export interface ChartDimensions {
  width: number
  height: number
  padding: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

export interface ChartScale {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export interface RenderContext {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  dimensions: ChartDimensions
  scale: ChartScale
  devicePixelRatio: number
}

export interface AggregatedData {
  timestamp: number
  value: number
  count: number
  min: number
  max: number
  avg: number
}

export interface FilterState {
  startTime: number
  endTime: number
  selectedCategories: string[]
  minValue: number
  maxValue: number
  aggregationPeriod: "raw" | "1min" | "5min" | "1hour"
}

export interface PerformanceMetrics {
  fps: number
  frameTime: number
  memoryUsage: number
  lastUpdateTime: number
  dataPointsRendered: number
  renderTime: number
}

export interface DashboardState {
  data: Map<string, TimeSeries>
  filters: FilterState
  zoom: {
    x: number
    y: number
  }
  pan: {
    x: number
    y: number
  }
  selectedSeries: Set<string>
  metrics: PerformanceMetrics
}
