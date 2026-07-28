import { getBookletSidePairs } from '@/lib/imposition/pageOrdering'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface FoldDiagramProps {
  paddedPages: number
  sourcePageCount: number
}

export function FoldDiagram({ paddedPages, sourcePageCount }: FoldDiagramProps) {
  if (paddedPages === 0 || paddedPages % 4 !== 0) return null

  const pairs = getBookletSidePairs(paddedPages)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Fold & Print Guide</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs text-muted-foreground">
        <p>
          Print double-sided (flip on long edge). Fold each sheet in half, nest sheets, and staple
          along the spine.
        </p>
        <div className="space-y-2 rounded-md bg-muted/40 p-3 font-mono text-[11px] text-foreground">
          {pairs.map((pair, index) => (
            <div key={index} className="space-y-1">
              <div>
                Sheet {index + 1} front:{' '}
                <span className="text-primary">
                  {formatPage(pair.frontLeft, sourcePageCount)} |{' '}
                  {formatPage(pair.frontRight, sourcePageCount)}
                </span>
              </div>
              <div>
                Sheet {index + 1} back:{' '}
                <span className="text-primary">
                  {formatPage(pair.backLeft, sourcePageCount)} |{' '}
                  {formatPage(pair.backRight, sourcePageCount)}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p>Blank pages are added automatically when needed for correct folding.</p>
      </CardContent>
    </Card>
  )
}

function formatPage(pageNumber: number, sourcePageCount: number): string {
  if (pageNumber < 1 || pageNumber > sourcePageCount) return 'Blank'
  return String(pageNumber)
}
