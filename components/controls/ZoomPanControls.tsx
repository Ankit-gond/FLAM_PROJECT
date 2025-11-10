"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ZoomPanControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onPanLeft: () => void
  onPanRight: () => void
  onReset: () => void
  zoomLevel?: number
}

export function ZoomPanControls({
  onZoomIn,
  onZoomOut,
  onPanLeft,
  onPanRight,
  onReset,
  zoomLevel = 1,
}: ZoomPanControlsProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base">Navigation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={onZoomIn} variant="outline" size="sm" className="text-xs bg-transparent">
            Zoom In
          </Button>
          <Button onClick={onZoomOut} variant="outline" size="sm" className="text-xs bg-transparent">
            Zoom Out
          </Button>
          <Button onClick={onPanLeft} variant="outline" size="sm" className="text-xs bg-transparent">
            Pan Left
          </Button>
          <Button onClick={onPanRight} variant="outline" size="sm" className="text-xs bg-transparent">
            Pan Right
          </Button>
        </div>

        <Button onClick={onReset} variant="default" size="sm" className="w-full text-xs">
          Reset View
        </Button>

        <div className="text-center text-xs text-muted-foreground">Zoom: {zoomLevel.toFixed(2)}x</div>
      </CardContent>
    </Card>
  )
}
