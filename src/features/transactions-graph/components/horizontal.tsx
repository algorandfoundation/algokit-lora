import { fixedForwardRef } from '@/utils/fixed-forward-ref'
import { InnerTransaction, Transaction, TransactionType } from '@/features/transactions/models'
import {
  TransactionGraphHorizontal,
  TransactionGraphPoint,
  TransactionGraphSelfLoop,
  TransactionGraphVector,
  TransactionGraphVertical,
  TransactionGraphVisualizationType,
  TransactionGraphVisualizationDescriptionType,
} from '@/features/transactions-graph'
import { graphConfig } from '@/features/transactions-graph/components/graph-config'
import { cn } from '@/features/common/utils'
import SvgPointerLeft from '@/features/common/components/svg/pointer-left'
import PointerLeft from '@/features/common/components/svg/pointer-left'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { DisplayAssetAmount } from '@/features/common/components/display-asset-amount'
import { HorizontalTitle } from '@/features/transactions-graph/components/horizontal-title'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/features/common/components/tooltip'
import { PaymentTransactionTooltipContent } from '@/features/transactions-graph/components/payment-transaction-tooltip-content'
import { AssetTransferTransactionTooltipContent } from '@/features/transactions-graph/components/asset-transfer-transaction-tooltip-content'
import { AppCallTransactionTooltipContent } from '@/features/transactions-graph/components/app-call-transaction-tooltip-content'
import { AssetConfigTransactionTooltipContent } from '@/features/transactions-graph/components/asset-config-transaction-tooltip-content'
import { AssetFreezeTransactionTooltipContent } from '@/features/transactions-graph/components/asset-freeze-transaction-tooltip-content'
import { KeyRegTransactionTooltipContent } from '@/features/transactions-graph/components/key-reg-transaction-tooltip-content'
import { StateProofTransactionTooltipContent } from './state-proof-transaction-tooltip-content'
import PointerRight from '@/features/common/components/svg/pointer-right'
import { SubHorizontalTitle } from '@/features/transactions-graph/components/sub-horizontal-title'

function ConnectionsFromAncestorsToAncestorsNextSiblings({ ancestors }: { ancestors: TransactionGraphHorizontal[] }) {
  return ancestors
    .filter((a) => a.hasNextSibling)
    .map((ancestor, i) => (
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
const colorClassMap = {
  [TransactionType.Payment]: { border: 'border-payment', text: 'text-payment' },
  [TransactionType.AssetTransfer]: { border: 'border-asset-transfer', text: 'text-asset-transfer' },
  [TransactionType.AppCall]: { border: 'border-application-call', text: 'text-application-call' },
  [TransactionType.AssetConfig]: { border: 'border-asset-config', text: 'text-asset-config' },
  [TransactionType.AssetFreeze]: { border: 'border-asset-freeze', text: 'text-asset-freeze' },
  [TransactionType.KeyReg]: { border: 'border-key-registration', text: 'text-key-registration' },
  [TransactionType.StateProof]: { border: 'border-state-proof', text: 'text-state-proof' },
}

function Circle({ className, text }: { className?: string; text?: string | number }) {
  return (
    <div
      className={cn('inline-flex size-5 items-center justify-center overflow-hidden rounded-full border bg-card text-[0.6rem]', className)}
    >
      {text}
    </div>
  )
}

function VectorVisualizationDescription({
  transaction,
  vector,
}: {
  transaction: Transaction | InnerTransaction
  vector: TransactionGraphVector
}) {
  const colorClass = colorClassMap[transaction.type]
  if (vector.description.type === TransactionGraphVisualizationDescriptionType.Payment) {
    return (
      <>
        <span>Payment</span>
        <DisplayAlgo className="flex justify-center" amount={vector.description.amount} short={true} />
      </>
    )
  }
  if (vector.description.type === TransactionGraphVisualizationDescriptionType.PaymentCloseOut) {
    return (
      <>
        <span>Close Out</span>
        <DisplayAlgo className="flex justify-center" amount={vector.description.amount} short={true} />
      </>
    )
  }
  if (vector.description.type === TransactionGraphVisualizationDescriptionType.AssetTransfer) {
    return (
      <>
        <span>Transfer</span>
        <DisplayAssetAmount
          asset={vector.description.asset}
          amount={vector.description.amount}
          className={cn('flex justify-center', colorClass.text)}
          linkClassName={colorClass.text}
          short={true}
        />
      </>
    )
  }
  if (vector.description.type === TransactionGraphVisualizationDescriptionType.AssetCloseOut) {
    return (
      <>
        <span>Close Out</span>
        <DisplayAssetAmount
          className={cn('pl-1 pr-1 bg-card flex justify-center')}
          amount={vector.description.amount}
          asset={vector.description.asset}
          linkClassName={colorClass.text}
        />
      </>
    )
  }
  return <span>{vector.description.type}</span>
}

function SelfLoopVisualizationDescription({
  transaction,
  loop,
}: {
  transaction: Transaction | InnerTransaction
  loop: TransactionGraphSelfLoop
}) {
  const colorClass = colorClassMap[transaction.type]
  if (loop.description.type === TransactionGraphVisualizationDescriptionType.Payment) {
    return <DisplayAlgo className={cn('w-min pl-1 pr-1 bg-card flex justify-center')} amount={loop.description.amount} short={true} />
  }
  if (loop.description.type === TransactionGraphVisualizationDescriptionType.AssetTransfer) {
    return (
      <DisplayAssetAmount
        className={cn('w-min pl-1 pr-1 bg-card flex justify-center')}
        amount={loop.description.amount}
        asset={loop.description.asset}
        linkClassName={colorClass.text}
        short={true}
      />
    )
  }
  if (loop.description.type === TransactionGraphVisualizationDescriptionType.PaymentCloseOut) {
    return (
      <>
        <span>Close Out</span>
        <DisplayAlgo className="flex justify-center" amount={loop.description.amount} short={true} />
      </>
    )
  }
  if (loop.description.type === TransactionGraphVisualizationDescriptionType.AssetCloseOut) {
    return (
      <>
        <span>Close Out</span>
        <DisplayAssetAmount
          className={cn('w-min pl-1 pr-1 bg-card flex justify-center')}
          amount={loop.description.amount}
          asset={loop.description.asset}
          linkClassName={colorClass.text}
        />
      </>
    )
  }
  return <span>{loop.description.type}</span>
}

const RenderTransactionVector = fixedForwardRef(
  (
    {
      transaction,
      vector,
      ...rest
    }: {
      transaction: Transaction | InnerTransaction
      vector: TransactionGraphVector
    },
    ref?: React.LegacyRef<HTMLDivElement>
  ) => {
    const colorClass = colorClassMap[transaction.type]

    return (
      <div
        className={cn('flex items-center justify-center z-10', colorClass.text)}
        style={{
          // 2 and 3 are the number to offset the name column
          gridColumnStart: vector.fromVerticalIndex + 2,
          gridColumnEnd: vector.toVerticalIndex + 3,
        }}
        ref={ref}
        {...rest}
      >
        <Circle className={colorClass.border} text={vector.direction === 'leftToRight' ? vector.fromAccountIndex : vector.toAccountIndex} />
        <div
          style={{
            width: `calc(${(100 - 100 / (vector.toVerticalIndex - vector.fromVerticalIndex + 1)).toFixed(2)}% - ${graphConfig.circleDimension}px)`,
            height: `${graphConfig.circleDimension}px`,
          }}
          className="relative"
        >
          {vector.direction === 'rightToLeft' && <PointerLeft className="absolute left-0 top-0" />}
          <div
            className={cn(colorClass.border)}
            style={{
              height: `calc(50% + ${graphConfig.lineWidth / 2}px)`,
              borderBottomWidth: graphConfig.lineWidth,
              margin: vector.direction === 'leftToRight' ? '0 1px 0 0' : '0 0 0 1px',
            }}
          ></div>
          {vector.direction === 'leftToRight' && <PointerRight className="absolute right-0 top-0" />}
        </div>
        <div className="absolute flex justify-center">
          <div className={cn('z-20 bg-card p-0.5 text-xs text-center')}>
            <VectorVisualizationDescription transaction={transaction} vector={vector} />
          </div>
        </div>
        <Circle className={colorClass.border} text={vector.direction === 'leftToRight' ? vector.toAccountIndex : vector.fromAccountIndex} />
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
      loop: TransactionGraphSelfLoop
    },
    ref?: React.LegacyRef<HTMLDivElement>
  ) => {
    const colorClass = colorClassMap[transaction.type]

    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-center relative z-10')}
        {...rest}
        style={{
          gridColumnStart: loop.fromVerticalIndex + 2, // 2 to offset the name column
          gridColumnEnd: loop.fromVerticalIndex + 4, // 4 to offset the name column and make this cell span 2 columns
        }}
      >
        <Circle className={cn(colorClass.border, 'z-10')} />
        <div
          style={{
            width: `50%`,
            height: `${graphConfig.circleDimension}px`,
          }}
          className={colorClass.text}
        >
          <SvgPointerLeft className={cn('relative')} style={{ left: `calc(50% + ${graphConfig.circleDimension})px` }} />
        </div>
        <div
          className={cn('absolute size-1/2', colorClass.text, colorClass.border)}
          style={{
            borderWidth: graphConfig.lineWidth,
            borderRadius: '4px',
            bottom: graphConfig.lineWidth / 2,
            right: `25%`,
          }}
        ></div>
        <div className={cn('absolute flex w-1/2 justify-center text-xs', colorClass.text)}>
          <SelfLoopVisualizationDescription transaction={transaction} loop={loop} />
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
      point: TransactionGraphPoint
    },
    ref?: React.LegacyRef<HTMLDivElement>
  ) => {
    const colorClass = colorClassMap[transaction.type]

    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-center relative z-10')}
        {...rest}
        style={{
          // 2 and 3 are the number to offset the name column
          gridColumnStart: point.fromVerticalIndex + 2,
          gridColumnEnd: point.fromVerticalIndex + 3,
        }}
      >
        <Circle className={colorClass.border} />
      </div>
    )
  }
)

type Props = {
  horizontal: TransactionGraphHorizontal
  verticals: TransactionGraphVertical[]
}
export function Horizontal({ horizontal, verticals }: Props) {
  const { transaction, visualization, ancestors, isSubHorizontal } = horizontal

  return (
    <>
      <div className={cn('p-0 relative')}>
        <ConnectionsFromAncestorsToAncestorsNextSiblings ancestors={ancestors} />
        {!isSubHorizontal && <HorizontalTitle horizontal={horizontal} />}
        {isSubHorizontal && <SubHorizontalTitle horizontal={horizontal} />}
      </div>
      {verticals.map((_, index) => {
        if (
          visualization.shape === TransactionGraphVisualizationType.Vector &&
          (index < visualization.fromVerticalIndex || index > visualization.toVerticalIndex)
        ) {
          return <div key={index}></div>
        }
        if (visualization.shape === TransactionGraphVisualizationType.Point && index > visualization.fromVerticalIndex)
          return <div key={index}></div>
        // The `index > transactionRepresentation.from + 1` is here
        // because a self-loop vector is rendered across 2 grid cells (see RenderTransactionSelfLoop).
        // Therefore, we skip this cell so that we won't cause overflowing
        if (visualization.shape === TransactionGraphVisualizationType.SelfLoop && index > visualization.fromVerticalIndex + 1)
          return <div key={index}></div>

        if (index === visualization.fromVerticalIndex)
          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                {visualization.shape === TransactionGraphVisualizationType.Vector ? (
                  <RenderTransactionVector key={index} vector={visualization} transaction={transaction} />
                ) : visualization.shape === TransactionGraphVisualizationType.SelfLoop ? (
                  <RenderTransactionSelfLoop key={index} loop={visualization} transaction={transaction} />
                ) : visualization.shape === TransactionGraphVisualizationType.Point ? (
                  <RenderTransactionPoint key={index} point={visualization} transaction={transaction} />
                ) : null}
              </TooltipTrigger>
              <TooltipContent>
                {transaction.type === TransactionType.Payment && <PaymentTransactionTooltipContent transaction={transaction} />}
                {transaction.type === TransactionType.AssetTransfer && <AssetTransferTransactionTooltipContent transaction={transaction} />}
                {transaction.type === TransactionType.AppCall && <AppCallTransactionTooltipContent transaction={transaction} />}
                {transaction.type === TransactionType.AssetConfig && <AssetConfigTransactionTooltipContent transaction={transaction} />}
                {transaction.type === TransactionType.AssetFreeze && <AssetFreezeTransactionTooltipContent transaction={transaction} />}
                {transaction.type === TransactionType.KeyReg && <KeyRegTransactionTooltipContent transaction={transaction} />}
                {transaction.type === TransactionType.StateProof && <StateProofTransactionTooltipContent transaction={transaction} />}
              </TooltipContent>
            </Tooltip>
          )
        return null
      })}
    </>
  )
}
