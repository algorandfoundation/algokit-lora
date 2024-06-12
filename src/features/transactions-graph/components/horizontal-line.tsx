import { fixedForwardRef } from '@/utils/fixed-forward-ref'
import { InnerTransaction, Transaction, TransactionType } from '@/features/transactions/models'
import {
  TransactionGraphHorizontalLine,
  TransactionGraphPointVisualization,
  TransactionGraphSelfLoopVisualization,
  TransactionGraphVectorVisualization,
  TransactionGraphVerticalLine,
} from '@/features/transactions-graph'
import { graphConfig } from '@/features/transactions-graph/components/graph-config'
import { cn } from '@/features/common/utils'
import SvgCircle from '@/features/common/components/svg/circle'
import SvgPointerLeft from '@/features/common/components/svg/pointer-left'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { DisplayAssetAmount } from '@/features/common/components/display-asset-amount'
import { HorizontalLineTitle } from '@/features/transactions-graph/components/horizontal-line-title'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/features/common/components/tooltip'
import { PaymentTransactionTooltipContent } from '@/features/transactions-graph/components/payment-transaction-tooltip-content'
import { AssetTransferTransactionTooltipContent } from '@/features/transactions-graph/components/asset-transfer-transaction-tooltip-content'
import { AppCallTransactionTooltipContent } from '@/features/transactions-graph/components/app-call-transaction-tooltip-content'
import { AssetConfigTransactionTooltipContent } from '@/features/transactions-graph/components/asset-config-transaction-tooltip-content'
import { AssetFreezeTransactionTooltipContent } from '@/features/transactions-graph/components/asset-freeze-transaction-tooltip-content'
import { KeyRegTransactionTooltipContent } from '@/features/transactions-graph/components/key-reg-transaction-tooltip-content'
import SvgPointerRight from '@/features/common/components/svg/pointer-right'

function ConnectionsFromAncestorsToAncestorsNextSiblings({ ancestors }: { ancestors: TransactionGraphHorizontalLine[] }) {
  return ancestors.map((ancestor, i) => (
    <div
      key={i}
      className={cn('h-full border-primary absolute')}
      style={{
        marginLeft: (ancestor.depth - 1) * graphConfig.indentationWidth,
        borderLeftWidth: `${graphConfig.lineWidth}px`,
      }}
    ></div>
  ))
}

const RenderTransactionVector = fixedForwardRef(
  (
    {
      transaction,
      vector,
      ...rest
    }: {
      transaction: Transaction | InnerTransaction
      vector: TransactionGraphVectorVisualization
    },
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
    {
      transaction,
      loop,
      ...rest
    }: {
      transaction: Transaction | InnerTransaction
      loop: TransactionGraphSelfLoopVisualization
    },
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
    {
      transaction,
      point,
      ...rest
    }: {
      transaction: Transaction | InnerTransaction
      point: TransactionGraphPointVisualization
    },
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

type Props = {
  horizontalLine: TransactionGraphHorizontalLine
  verticalLines: TransactionGraphVerticalLine[]
}
export function HorizontalLine({ horizontalLine, verticalLines }: Props) {
  const { transaction, visualization, ancestors } = horizontalLine

  return (
    <>
      <div className={cn('p-0 relative pr-8')}>
        <ConnectionsFromAncestorsToAncestorsNextSiblings ancestors={ancestors} />
        <HorizontalLineTitle horizontalLine={horizontalLine} />
      </div>
      {verticalLines.map((_, index) => {
        if (visualization.type === 'vector' && (index < visualization.from || index > visualization.to)) {
          return <div key={index}></div>
        }
        if (visualization.type === 'point' && index > visualization.from) return <div key={index}></div>
        // The `index > transactionRepresentation.from + 1` is here
        // because a self-loop vector is rendered across 2 grid cells (see RenderTransactionSelfLoop).
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
