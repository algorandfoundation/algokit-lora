import SvgCircle from '@/features/common/components/svg/circle'
import SvgPointerLeft from '@/features/common/components/svg/pointer-left'
import SvgPointerRight from '@/features/common/components/svg/pointer-right'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/features/common/components/tooltip'
import { cn } from '@/features/common/utils'
import { fixedForwardRef } from '@/utils/fixed-forward-ref'
import { isDefined } from '@/utils/is-defined'
import { InnerTransaction, Transaction, TransactionType } from '../../transactions/models'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { DisplayAssetAmount } from '@/features/common/components/display-asset-amount'
import { PaymentTransactionTooltipContent } from './payment-transaction-tooltip-content'
import { AssetTransferTransactionTooltipContent } from './asset-transfer-transaction-tooltip-content'
import { AppCallTransactionTooltipContent } from './app-call-transaction-tooltip-content'
import { AssetConfigTransactionTooltipContent } from './asset-config-transaction-tooltip-content'
import { AssetFreezeTransactionTooltipContent } from './asset-freeze-transaction-tooltip-content'
import { KeyRegTransactionTooltipContent } from './key-reg-transaction-tooltip-content'
import {
  TransactionGraphVerticalLine,
  TransactionGraphPointVisualization,
  TransactionGraphHorizontalLine,
  TransactionGraphSelfLoopVisualization,
  TransactionGraphVectorVisualization,
  TransactionsGraphData,
} from '../models'
import { graphConfig } from '@/features/transactions-graph/components/graph-config'
import { HorizontalLineTitle } from '@/features/transactions-graph/components/horizontal-line-title'
import { VerticalLineTitle } from '@/features/transactions-graph/components/vertical-line-title'
import { useMemo } from 'react'

function VerticalBars({ verticalBars }: { verticalBars: (number | undefined)[] }) {
  // The side vertical bars when there are nested items
  return (verticalBars ?? [])
    .filter(isDefined)
    .map((b, i) => (
      <div
        key={i}
        className={cn('h-full border-primary absolute')}
        style={{ marginLeft: (b - 1) * graphConfig.indentationWidth, borderLeftWidth: `${graphConfig.lineWidth}px` }}
      ></div>
    ))
}

function ConnectionToParent() {
  // The connection between this transaction and the parent
  return (
    <div
      className={cn(`border-primary rounded-bl-lg`, `h-1/2`, `absolute top-0 left-0`)}
      style={{
        borderLeftWidth: `${graphConfig.lineWidth}px`,
        borderBottomWidth: `${graphConfig.lineWidth}px`,
        width: `${graphConfig.indentationWidth + 8}px`,
      }}
    ></div>
  )
}

function ConnectionToSibling() {
  // The connection between this transaction and the next sibling
  return (
    <div
      className={cn('border-primary', 'absolute left-0')}
      style={{
        width: `${graphConfig.indentationWidth + 8}px`,
        borderLeftWidth: `${graphConfig.lineWidth}px`,
        height: `calc(50% + ${graphConfig.lineWidth}px)`,
        top: `calc(50% - ${graphConfig.lineWidth}px)`,
      }}
    ></div>
  )
}

function ConnectionToChildren({ indentLevel }: { indentLevel: number }) {
  // The connection between this transaction and the children
  return (
    <div
      className={cn('w-2', 'border-primary rounded-tl-lg', 'absolute left-0')}
      style={{
        marginLeft: indentLevel > 0 ? `${graphConfig.indentationWidth}px` : undefined,
        borderLeftWidth: `${graphConfig.lineWidth}px`,
        borderTopWidth: `${graphConfig.lineWidth}px`,
        height: `calc(50% + ${graphConfig.lineWidth}px)`,
        top: `calc(50% - ${graphConfig.lineWidth}px)`,
      }}
    ></div>
  )
}

const RenderTransactionVector = fixedForwardRef(
  (
    { transaction, vector, ...rest }: { transaction: Transaction | InnerTransaction; vector: TransactionGraphVectorVisualization },
    ref?: React.LegacyRef<HTMLDivElement>
  ) => {
    const color = graphConfig.paymentTransactionColor

    return (
      <div
        className={cn('flex items-center justify-center z-10')}
        style={{
          // 2 and 3 are the number to offset the name column
          gridColumnStart: vector.from + 2,
          gridColumnEnd: vector.to + 3,
          color: color,
        }}
        ref={ref}
        {...rest}
      >
        <SvgCircle width={graphConfig.circleDimension} height={graphConfig.circleDimension}></SvgCircle>
        <div
          style={{
            width: `calc(${(100 - 100 / (vector.to - vector.from + 1)).toFixed(2)}% - ${graphConfig.circleDimension}px)`,
            height: `${graphConfig.circleDimension}px`,
          }}
          className="relative"
        >
          {vector.direction === 'rightToLeft' && <SvgPointerLeft className={cn('absolute top-0 left-0')} />}
          <div className={cn('h-1/2')} style={{ borderBottomWidth: graphConfig.lineWidth, borderColor: color }}></div>
          {vector.direction === 'leftToRight' && <SvgPointerRight className={cn('absolute top-0 right-0')} />}
        </div>
        <div className={cn('absolute z-20 bg-card p-2 text-foreground w-20 text-xs text-center')}>
          {transaction.type === TransactionType.Payment && (
            <>
              Payment
              <DisplayAlgo amount={transaction.amount} />
            </>
          )}
          {transaction.type === TransactionType.AssetTransfer && (
            <>
              Transfer
              <DisplayAssetAmount asset={transaction.asset} amount={transaction.amount} />
            </>
          )}
          {transaction.type === TransactionType.ApplicationCall && <>App Call</>}
          {transaction.type === TransactionType.AssetConfig && <>Asset Config</>}
          {transaction.type === TransactionType.AssetFreeze && <>Asset Freeze</>}
        </div>

        <SvgCircle width={graphConfig.circleDimension} height={graphConfig.circleDimension}></SvgCircle>
      </div>
    )
  }
)

const RenderTransactionSelfLoop = fixedForwardRef(
  (
    { transaction, loop, ...rest }: { transaction: Transaction | InnerTransaction; loop: TransactionGraphSelfLoopVisualization },
    ref?: React.LegacyRef<HTMLDivElement>
  ) => {
    const color = graphConfig.paymentTransactionColor

    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-center relative z-10')}
        {...rest}
        style={{
          gridColumnStart: loop.from + 2, // 2 to offset the name column
          gridColumnEnd: loop.from + 4, // 4 to offset the name column and make this cell span 2 columns
          color: color,
        }}
      >
        <SvgCircle width={graphConfig.circleDimension} height={graphConfig.circleDimension}></SvgCircle>
        <div
          style={{
            width: `50%`,
            height: `${graphConfig.circleDimension}px`,
          }}
        >
          <SvgPointerLeft className={cn('relative')} style={{ left: `calc(50% + ${graphConfig.circleDimension})px` }} />
        </div>
        <div
          className="absolute size-1/2"
          style={{
            borderWidth: graphConfig.lineWidth,
            borderColor: color,
            borderRadius: '4px',
            bottom: graphConfig.lineWidth / 2,
            right: `25%`,
          }}
        ></div>
        <div className={cn('absolute text-foreground right-1/4 w-[40%] flex justify-center')}>
          {transaction.type === TransactionType.Payment && (
            <DisplayAlgo className={cn('w-min pl-1 pr-1 bg-card')} amount={transaction.amount} />
          )}
          {transaction.type === TransactionType.AssetTransfer && (
            <DisplayAssetAmount className={cn('w-min pl-1 pr-1 bg-card')} amount={transaction.amount} asset={transaction.asset} />
          )}
        </div>
      </div>
    )
  }
)

const RenderTransactionPoint = fixedForwardRef(
  (
    { transaction, point, ...rest }: { transaction: Transaction | InnerTransaction; point: TransactionGraphPointVisualization },
    ref?: React.LegacyRef<HTMLDivElement>
  ) => {
    const color = graphConfig.paymentTransactionColor

    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-center relative z-10')}
        {...rest}
        style={{
          // 2 and 3 are the number to offset the name column
          gridColumnStart: point.from + 2,
          gridColumnEnd: point.from + 3,
          color: color,
        }}
      >
        <SvgCircle width={graphConfig.circleDimension} height={graphConfig.circleDimension}></SvgCircle>
      </div>
    )
  }
)

type HorizontalLineProps = {
  horizontalLine: TransactionGraphHorizontalLine
  verticalLines: TransactionGraphVerticalLine[]
}
function HorizontalLine({ horizontalLine, verticalLines }: HorizontalLineProps) {
  const { transaction, visualization, hasNextSibling, ancestors, depth } = horizontalLine
  const parent = ancestors.length > 0 ? ancestors[0] : undefined
  const hasChildren =
    horizontalLine.transaction.type === TransactionType.ApplicationCall && horizontalLine.transaction.innerTransactions.length > 0
  const hasParent = !!parent
  const indentLevel = depth > 0 ? depth - 1 : 0
  // TODO: rename verticalBars to something like "connections between parents to parents next sibling"
  const verticalBars = useMemo(() => {
    return ancestors.map((a) => (a.hasNextSibling ? a.depth : undefined))
  }, [ancestors])

  return (
    <>
      <div className={cn('p-0 relative pr-8')}>
        <VerticalBars verticalBars={verticalBars} />
        <div
          className={cn(`relative h-full p-0 flex items-center`, 'px-0')}
          style={{ marginLeft: indentLevel * graphConfig.indentationWidth }}
        >
          {hasParent && <ConnectionToParent />}
          <HorizontalLineTitle transaction={transaction} hasParent={hasParent} />
          {hasParent && hasNextSibling && <ConnectionToSibling />}
          {hasChildren && <ConnectionToChildren indentLevel={depth} />}
        </div>
      </div>
      {verticalLines.map((_, index) => {
        if (visualization.type === 'vector' && (index < visualization.from || index > visualization.to)) {
          return <div key={index}></div>
        }
        if (visualization.type === 'point' && index > visualization.from) return <div key={index}></div>
        // The `index > transactionRepresentation.from + 1` is here
        // because a self-loop vector is renderred across 2 grid cells (see RenderTransactionSelfLoop).
        // Therefore, we skip this cell so that we won't cause overflowing
        if (visualization.type === 'selfLoop' && index > visualization.from + 1) return <div key={index}></div>

        if (index === visualization.from)
          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                {visualization.type === 'vector' ? (
                  <RenderTransactionVector key={index} vector={visualization} transaction={transaction} />
                ) : visualization.type === 'selfLoop' ? (
                  <RenderTransactionSelfLoop key={index} loop={visualization} transaction={transaction} />
                ) : visualization.type === 'point' ? (
                  <RenderTransactionPoint key={index} point={visualization} transaction={transaction} />
                ) : null}
              </TooltipTrigger>
              <TooltipContent>
                {transaction.type === TransactionType.Payment && <PaymentTransactionTooltipContent transaction={transaction} />}
                {transaction.type === TransactionType.AssetTransfer && <AssetTransferTransactionTooltipContent transaction={transaction} />}
                {transaction.type === TransactionType.ApplicationCall && <AppCallTransactionTooltipContent transaction={transaction} />}
                {transaction.type === TransactionType.AssetConfig && <AssetConfigTransactionTooltipContent transaction={transaction} />}
                {transaction.type === TransactionType.AssetFreeze && <AssetFreezeTransactionTooltipContent transaction={transaction} />}
                {transaction.type === TransactionType.KeyReg && <KeyRegTransactionTooltipContent transaction={transaction} />}
              </TooltipContent>
            </Tooltip>
          )
        return null
      })}
    </>
  )
}

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
