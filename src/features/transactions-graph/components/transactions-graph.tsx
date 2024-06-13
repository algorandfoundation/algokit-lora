import { cn } from '@/features/common/utils'
import { TransactionsGraphData } from '../models'
import { graphConfig } from '@/features/transactions-graph/components/graph-config'
import { VerticalLineTitle } from '@/features/transactions-graph/components/vertical-line-title'
import { HorizontalLine } from '@/features/transactions-graph/components/horizontal-line'

type Props = {
  transactionsGraphData: TransactionsGraphData
}
export function TransactionsGraph({ transactionsGraphData }: Props) {
  const { verticalLines, horizontalLines } = transactionsGraphData
  const transactionsCount = horizontalLines.length
  const maxNestingLevel = Math.max(...horizontalLines.map((h) => h.depth))
  const firstColumnWidth = graphConfig.colWidth + maxNestingLevel * graphConfig.indentationWidth
  const verticalLinesCount = verticalLines.length
  const gridTemplateColumns = `minmax(${firstColumnWidth}px, ${firstColumnWidth}px) repeat(${verticalLinesCount}, ${graphConfig.colWidth}px)`

  return (
    <>
      <div
        className={cn('relative grid')}
        style={{
          gridTemplateColumns: `${gridTemplateColumns}`,
        }}
      >
        <div>{/* The first header cell is empty */}</div>
        {verticalLines.map((swimlane, index) => (
          <div className={cn('p-2 flex justify-center')} key={index}>
            <VerticalLineTitle verticalLine={swimlane} />
          </div>
        ))}
      </div>
      <div
        className={cn('relative grid')}
        style={{
          gridTemplateColumns: `${gridTemplateColumns}`,
          gridTemplateRows: `repeat(${transactionsCount}, ${graphConfig.rowHeight}px)`,
        }}
      >
        {/* The below div is for drawing the background dash lines */}
        <div className={cn('absolute left-0')}>
          <div>
            <div className={cn('p-0')}></div>
            <div
              className={cn('p-0')}
              style={{
                height: `${transactionsCount * graphConfig.rowHeight}px`,
                width: `${graphConfig.colWidth * verticalLinesCount}px`,
              }}
            >
              <div
                className={cn('grid h-full')}
                style={{
                  gridTemplateColumns: `${gridTemplateColumns}`,
                  height: `${transactionsCount * graphConfig.rowHeight}px`,
                }}
              >
                <div></div>
                {verticalLines
                  .filter((a) => a.type !== 'Placeholder') // Don't need to draw for the empty swimlane
                  .map((_, index) => (
                    <div key={index} className={cn('flex justify-center')}>
                      <div className={cn('border-muted h-full border-dashed')} style={{ borderLeftWidth: graphConfig.lineWidth }}></div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
        {horizontalLines.map((row, index) => (
          <HorizontalLine key={index} verticalLines={verticalLines} horizontalLine={row} />
        ))}
      </div>
    </>
  )
}
