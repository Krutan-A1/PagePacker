import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface SheetNavigatorProps {
  activeSideIndex: number
  totalSides: number
  physicalSheetIndex: number
  physicalSheetCount: number
  side: 'front' | 'back'
  duplex: boolean
  onPrev: () => void
  onNext: () => void
  onSideChange: (side: 'front' | 'back') => void
  onSliderChange: (index: number) => void
}

export function SheetNavigator({
  activeSideIndex,
  totalSides,
  physicalSheetIndex,
  physicalSheetCount,
  side,
  duplex,
  onPrev,
  onNext,
  onSideChange,
  onSliderChange,
}: SheetNavigatorProps) {
  if (totalSides === 0) return null

  return (
    <div className="shrink-0 flex flex-col gap-2 rounded-lg border border-border bg-card/80 p-2.5 sm:gap-3 sm:p-3">
      <div className="flex items-center justify-between gap-2">
        <Button variant="outline" size="icon" onClick={onPrev} disabled={activeSideIndex <= 0}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="min-w-0 text-center text-sm">
          <p className="font-medium">
            Sheet {physicalSheetIndex + 1} of {physicalSheetCount}
          </p>
          <p className="truncate text-xs capitalize text-muted-foreground">
            {side} · Side {activeSideIndex + 1}/{totalSides}
          </p>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={onNext}
          disabled={activeSideIndex >= totalSides - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Slider
        min={0}
        max={Math.max(0, totalSides - 1)}
        step={1}
        value={[activeSideIndex]}
        onValueChange={([value]) => onSliderChange(value)}
      />

      {duplex && (
        <Tabs value={side} onValueChange={(value) => onSideChange(value as 'front' | 'back')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="front">Front</TabsTrigger>
            <TabsTrigger value="back">Back</TabsTrigger>
          </TabsList>
        </Tabs>
      )}
    </div>
  )
}
