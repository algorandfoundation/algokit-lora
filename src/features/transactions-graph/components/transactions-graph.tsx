import { cn } from '@/features/common/utils'
import { TransactionsGraphData } from '../models'
import { graphConfig } from '@/features/transactions-graph/components/graph-config'
import { VerticalTitle } from '@/features/transactions-graph/components/vertical-title'
import { Horizontal } from '@/features/transactions-graph/components/horizontal'
import html2canvas from 'html2canvas-pro'
import { useCallback, useRef } from 'react'
import { Button } from '@/features/common/components/button'
import { Download } from 'lucide-react'

type Props = {
  transactionsGraphData: TransactionsGraphData
}
export function TransactionsGraph({ transactionsGraphData }: Props) {
  const { verticals, horizontals } = transactionsGraphData
  const horizontalsCount = horizontals.length
  const maxNestingLevel = Math.max(...horizontals.map((h) => h.depth))
  const horizontalTitleWidth = graphConfig.defaultHorizontalTitleWidth + maxNestingLevel * graphConfig.indentationWidth
  const verticalsCount = verticals.length
  const gridTemplateColumns = `minmax(${horizontalTitleWidth}px, ${horizontalTitleWidth}px) repeat(${verticalsCount}, ${graphConfig.colWidth}px)`

  const visualRef = useRef<HTMLDivElement>(null)

  const downloadImage = useCallback(async () => {
    const visual = visualRef.current
    if (!visual) return
    const canvas = await html2canvas(visual, {
      scale: 2,
      onclone: (_, element) => {
        element.style.padding = '10px'
      },
    })
    const dataUrl = canvas.toDataURL()
    const link = document.createElement('a')
    link.href = dataUrl
    link.setAttribute('download', 'transactions-visual.png')
    // TODO: This approach won't work in Tauri, so we'll need to handle with Tauri's APIs
    link.click()
  }, [])

  return (
    <div className="relative">
      <div className="w-min bg-card" ref={visualRef} aria-label="Visual representation of transactions">
        <div
          className={cn('relative grid')}
          style={{
            gridTemplateColumns: `${gridTemplateColumns}`,
          }}
        >
          <div>{/* The first header cell is empty */}</div>
          {verticals.map((vertical, index) => (
            <div className={cn('p-2 flex justify-center')} key={index}>
              <VerticalTitle vertical={vertical} />
            </div>
          ))}
        </div>
        <div
          className={cn('relative grid')}
          style={{
            gridTemplateColumns: `${gridTemplateColumns}`,
            gridTemplateRows: `repeat(${horizontalsCount}, ${graphConfig.rowHeight}px)`,
          }}
        >
          {/* The below div is for drawing the background dash lines */}
          <div className={cn('absolute left-0')}>
            <div>
              <div className={cn('p-0')}></div>
              <div
                className={cn('p-0')}
                style={{
                  height: `${horizontalsCount * graphConfig.rowHeight}px`,
                  width: `${graphConfig.colWidth * verticalsCount}px`,
                }}
              >
                <div
                  className={cn('grid h-full')}
                  style={{
                    gridTemplateColumns: `${gridTemplateColumns}`,
                    height: `${horizontalsCount * graphConfig.rowHeight}px`,
                  }}
                >
                  <div></div>
                  {verticals
                    .filter((a) => a.type !== 'Placeholder') // Don't need to draw for the empty vertical
                    .map((_, index) => (
                      <div key={index} className={cn('flex justify-center')}>
                        <div className={cn('border h-full border-dashed')} style={{ borderLeftWidth: graphConfig.lineWidth }}></div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
          {horizontals.map((row, index) => (
            <Horizontal key={index} verticals={verticals} horizontal={row} />
          ))}
        </div>
      </div>
      <Button
        className="absolute bottom-1 right-0 w-32"
        variant="outline"
        onClick={downloadImage}
        icon={<Download className="mr-2 size-4" />}
      >
        Download
      </Button>
    </div>
  )
}
