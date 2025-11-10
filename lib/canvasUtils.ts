// Canvas rendering utilities for high-performance drawing

import type { ChartDimensions, ChartScale, RenderContext } from "./types"

export class CanvasRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private devicePixelRatio: number

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")!
    this.devicePixelRatio = window.devicePixelRatio || 1
    this.setupHighDPI()
  }

  private setupHighDPI(): void {
    const width = this.canvas.offsetWidth
    const height = this.canvas.offsetHeight

    this.canvas.width = width * this.devicePixelRatio
    this.canvas.height = height * this.devicePixelRatio
    this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio)
  }

  getRenderContext(dimensions: ChartDimensions, scale: ChartScale): RenderContext {
    return {
      canvas: this.canvas,
      ctx: this.ctx,
      dimensions,
      scale,
      devicePixelRatio: this.devicePixelRatio,
    }
  }

  clear(width: number, height: number): void {
    this.ctx.clearRect(0, 0, width, height)
  }

  drawLine(x1: number, y1: number, x2: number, y2: number, color: string, width = 1): void {
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = width
    this.ctx.lineCap = "round"
    this.ctx.lineJoin = "round"
    this.ctx.beginPath()
    this.ctx.moveTo(x1, y1)
    this.ctx.lineTo(x2, y2)
    this.ctx.stroke()
  }

  drawRect(
    x: number,
    y: number,
    width: number,
    height: number,
    fillColor: string,
    strokeColor?: string,
    strokeWidth = 1,
  ): void {
    this.ctx.fillStyle = fillColor
    this.ctx.fillRect(x, y, width, height)

    if (strokeColor) {
      this.ctx.strokeStyle = strokeColor
      this.ctx.lineWidth = strokeWidth
      this.ctx.strokeRect(x, y, width, height)
    }
  }

  drawCircle(x: number, y: number, radius: number, fillColor: string, strokeColor?: string, strokeWidth = 1): void {
    this.ctx.fillStyle = fillColor
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, 0, Math.PI * 2)
    this.ctx.fill()

    if (strokeColor) {
      this.ctx.strokeStyle = strokeColor
      this.ctx.lineWidth = strokeWidth
      this.ctx.stroke()
    }
  }

  drawText(
    text: string,
    x: number,
    y: number,
    color: string,
    font = "12px sans-serif",
    align: CanvasTextAlign = "left",
  ): void {
    this.ctx.fillStyle = color
    this.ctx.font = font
    this.ctx.textAlign = align
    this.ctx.textBaseline = "middle"
    this.ctx.fillText(text, x, y)
  }

  scaleX(value: number, scale: ChartScale, width: number, padding: number): number {
    const range = scale.maxX - scale.minX
    return ((value - scale.minX) / range) * (width - padding * 2) + padding
  }

  scaleY(value: number, scale: ChartScale, height: number, padding: number): number {
    const range = scale.maxY - scale.minY
    return height - padding - ((value - scale.minY) / range) * (height - padding * 2)
  }

  drawGrid(dimensions: ChartDimensions, scale: ChartScale, gridColor = "#e5e7eb", gridOpacity = 0.5): void {
    const { width, height, padding } = dimensions
    this.ctx.globalAlpha = gridOpacity
    this.ctx.strokeStyle = gridColor

    // Vertical grid lines
    const xSteps = 10
    for (let i = 0; i <= xSteps; i++) {
      const x = padding.left + (i / xSteps) * (width - padding.left - padding.right)
      this.drawLine(x, padding.top, x, height - padding.bottom, gridColor, 0.5)
    }

    // Horizontal grid lines
    const ySteps = 5
    for (let i = 0; i <= ySteps; i++) {
      const y = padding.top + (i / ySteps) * (height - padding.top - padding.bottom)
      this.drawLine(padding.left, y, width - padding.right, y, gridColor, 0.5)
    }

    this.ctx.globalAlpha = 1
  }
}

export function createChartScale(data: Array<{ value: number; timestamp: number }>): ChartScale {
  if (data.length === 0) {
    return { minX: 0, maxX: 1, minY: 0, maxY: 1 }
  }

  const values = data.map((d) => d.value)
  const timestamps = data.map((d) => d.timestamp)

  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const minTime = Math.min(...timestamps)
  const maxTime = Math.max(...timestamps)

  // Add 10% padding
  const valuePadding = (maxValue - minValue) * 0.1 || 1
  const timePadding = (maxTime - minTime) * 0.05 || 1000

  return {
    minX: minTime - timePadding,
    maxX: maxTime + timePadding,
    minY: Math.max(0, minValue - valuePadding),
    maxY: maxValue + valuePadding,
  }
}
