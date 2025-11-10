"use client"

// Time range selector for filtering data

import { useCallback, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface TimeRangeSelectorProps {
  onRangeChange: (startTime: number, endTime: number) => void
  presets?: {
    label: string
    minutes: number
  }[]
}

export function TimeRangeSelector({
  onRangeChange,
  presets = [
    { label: "15m", minutes: 15 },
    { label: "1h", minutes: 60 },
    { label: "4h", minutes: 240 },
    { label: "24h", minutes: 1440 },
  ],
}: TimeRangeSelectorProps) {
  const [selectedPreset, setSelectedPreset] = useState<number>(1)
  const [customStart, setCustomStart] = useState<string>("")
  const [customEnd, setCustomEnd] = useState<string>("")

  const handlePresetClick = useCallback(
    (minutes: number, index: number) => {
      setSelectedPreset(index)
      const endTime = Date.now()
      const startTime = endTime - minutes * 60 * 1000
      onRangeChange(startTime, endTime)
    },
    [onRangeChange],
  )

  const handleCustomRange = useCallback(() => {
    if (!customStart || !customEnd) return

    const startTime = new Date(customStart).getTime()
    const endTime = new Date(customEnd).getTime()

    if (startTime >= endTime) {
      alert("Start time must be before end time")
      return
    }

    onRangeChange(startTime, endTime)
    setSelectedPreset(-1)
  }, [customStart, customEnd, onRangeChange])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base">Time Range</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {presets.map((preset, index) => (
            <Button
              key={index}
              onClick={() => handlePresetClick(preset.minutes, index)}
              variant={selectedPreset === index ? "default" : "outline"}
              size="sm"
              className="text-xs"
            >
              {preset.label}
            </Button>
          ))}
        </div>

        <div className="border-t pt-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Custom Range</p>
          <div className="flex gap-2 flex-col sm:flex-row">
            <input
              type="datetime-local"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="flex-1 px-3 py-2 border border-border rounded-md text-sm bg-background"
            />
            <input
              type="datetime-local"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="flex-1 px-3 py-2 border border-border rounded-md text-sm bg-background"
            />
            <Button onClick={handleCustomRange} variant="default" size="sm" className="text-xs">
              Apply
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
