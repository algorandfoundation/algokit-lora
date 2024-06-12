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
  const transactionCount = horizontalLines.length
  const maxNestingLevel = Math.max(...horizontalLines.map((h) => h.depth))
  const firstColumnWidth = graphConfig.colWidth + maxNestingLevel * graphConfig.indentationWidth
  const verticalLinesCount = verticalLines.length
  // TODO: why?
  const headerLines = Math.max(...verticalLines.map((s) => (s.type === 'Application' ? s.accounts.length + 1 : 1)))
  const headerHeight = headerLines > 1 ? headerLines * 0.75 * graphConfig.rowHeight : graphConfig.rowHeight

  return (
    <div
      className={cn('relative grid')}
      style={{
        gridTemplateColumns: `minmax(${firstColumnWidth}px, ${firstColumnWidth}px) repeat(${verticalLinesCount}, ${graphConfig.colWidth}px)`,
        gridTemplateRows: `${headerHeight}px repeat(${transactionCount}, ${graphConfig.rowHeight}px)`,
      }}
    >
      <div>{/* The first header cell is empty */}</div>
      {verticalLines.map((swimlane, index) => (
        <div className={cn('p-2 flex justify-center')} key={index}>
          <VerticalLineTitle verticalLine={swimlane} />
        </div>
      ))}
      {/* The below div is for drawing the background dash lines */}
      <div className={cn('absolute left-0')} style={{ top: `${headerHeight}px` }}>
        <div>
          <div className={cn('p-0')}></div>
          <div
            className={cn('p-0')}
            style={{
              height: `${transactionCount * graphConfig.rowHeight}px`,
              width: `${graphConfig.colWidth * verticalLinesCount}px`,
            }}
          >
            <div
              className={cn('grid h-full')}
              style={{
                gridTemplateColumns: `minmax(${firstColumnWidth}px, ${firstColumnWidth}px) repeat(${verticalLinesCount}, ${graphConfig.colWidth}px)`,
                height: `${transactionCount * graphConfig.rowHeight}px`,
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
  )
}
