import { cn } from '@/features/common/utils'
import { TransactionsGraphData } from '../models'
import { graphConfig } from '@/features/transactions-graph/components/graph-config'
import { VerticalTitle } from '@/features/transactions-graph/components/vertical-title'
import { Horizontal } from '@/features/transactions-graph/components/horizontal'
import { TransactionType } from '@/features/transactions/models'

type Props = {
  transactionsGraphData: TransactionsGraphData
}
export function TransactionsGraph({ transactionsGraphData }: Props) {
  const { verticals, horizontals, appSpecs } = transactionsGraphData
  const horizontalsCount = horizontals.length
  const maxNestingLevel = Math.max(...horizontals.map((h) => h.depth))
  const horizontalTitleWidth = graphConfig.defaultHorizontalTitleWidth + maxNestingLevel * graphConfig.indentationWidth
  const verticalsCount = verticals.length
  const gridTemplateColumns = `minmax(${horizontalTitleWidth}px, ${horizontalTitleWidth}px) repeat(${verticalsCount}, ${graphConfig.colWidth}px)`

  return (
    // Don't change this id value, it's used by a bot Alessandro is building.
    <div id="visual-transactions">
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
        {horizontals.map((row, index) => {
          const appSpec = row.transaction.type === TransactionType.AppCall ? appSpecs[row.transaction.applicationId] : undefined
          return <Horizontal key={index} verticals={verticals} horizontal={row} appSpec={appSpec} />
        })}
      </div>
    </div>
  )
}
