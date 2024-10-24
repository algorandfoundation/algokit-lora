import { fixedForwardRef } from '@/utils/fixed-forward-ref'
import { AppCallTransaction, InnerAppCallTransaction, InnerTransaction, Transaction, TransactionType } from '@/features/transactions/models'
import { Horizontal as HorizontalModel, LabelType, Point, RepresentationType, SelfLoop, Vector, Vertical } from '../models'
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
import { RenderAsyncAtom } from '@/features/common/components/render-async-atom'

function ConnectionsFromAncestorsToAncestorsNextSiblings({ ancestors }: { ancestors: HorizontalModel[] }) {
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
      className={cn('inline-flex relative size-5 items-center justify-center overflow-hidden rounded-full border text-[0.6rem]', className)}
    >
      {text}
    </div>
  )
}

function VectorLabelText({ type }: { type: LabelType }) {
  if (type === LabelType.Payment) return <span>Payment</span>
  if (type === LabelType.AssetTransfer) return <span>Transfer</span>
  if (type === LabelType.PaymentTransferRemainder || type === LabelType.AssetTransferRemainder) return <span>Remainder</span>
  if (type === LabelType.AppCall) return <span>App Call</span>
  if (type === LabelType.AppCreate) return <span>App Create</span>
  if (type === LabelType.AssetCreate) return <span>Asset Create</span>
  if (type === LabelType.AssetReconfigure)
    return (
      <span>
        Asset
        <br />
        Reconfigure
      </span>
    )
  if (type === LabelType.AssetDestroy)
    return (
      <span>
        Asset
        <br />
        Destroy
      </span>
    )
  if (type === LabelType.AssetFreeze) return <span>Asset Freeze</span>
  if (type === LabelType.KeyReg) return <span>Key Reg</span>
  if (type === LabelType.StateProof) return <span>State Proof</span>
  if (type === LabelType.Clawback) return <span>Clawback</span>
  return undefined
}

function AppCallAbiMethodName({ transaction }: { transaction: AppCallTransaction | InnerAppCallTransaction }) {
  return (
    <RenderAsyncAtom atom={transaction.abiMethod} fallback={''}>
      {(abiMethod) => {
        return abiMethod ? <div className="overflow-x-hidden text-ellipsis">{abiMethod.name}</div> : null
      }}
    </RenderAsyncAtom>
  )
}

function VectorLabel({ transaction, vector }: { transaction: Transaction | InnerTransaction; vector: Vector }) {
  const colorClass = colorClassMap[transaction.type]

  return (
    <>
      <VectorLabelText type={vector.label.type} />
      {vector.label.type === LabelType.AppCall && transaction.type === TransactionType.AppCall && (
        <AppCallAbiMethodName transaction={transaction} />
      )}
      {(vector.label.type === LabelType.Payment || vector.label.type === LabelType.PaymentTransferRemainder) && (
        <DisplayAlgo className="flex justify-center" amount={vector.label.amount} short={true} />
      )}
      {(vector.label.type === LabelType.AssetTransfer ||
        vector.label.type === LabelType.AssetTransferRemainder ||
        vector.label.type === LabelType.Clawback) && (
        <DisplayAssetAmount
          asset={vector.label.asset}
          amount={vector.label.amount}
          className={cn('flex justify-center', colorClass.text)}
          linkClassName={colorClass.text}
          short={true}
        />
      )}
    </>
  )
}

function SelfLoopLabel({ transaction, loop }: { transaction: Transaction | InnerTransaction; loop: SelfLoop }) {
  const colorClass = colorClassMap[transaction.type]
  return (
    <>
      <VectorLabelText type={loop.label.type} />
      {loop.label.type === LabelType.AppCall && transaction.type === TransactionType.AppCall && (
        <AppCallAbiMethodName transaction={transaction} />
      )}
      {(loop.label.type === LabelType.Payment || loop.label.type === LabelType.PaymentTransferRemainder) && (
        <DisplayAlgo className={cn('flex justify-center')} amount={loop.label.amount} short={true} />
      )}
      {(loop.label.type === LabelType.AssetTransfer ||
        loop.label.type === LabelType.AssetTransferRemainder ||
        loop.label.type === LabelType.Clawback) && (
        <DisplayAssetAmount
          className={cn('flex justify-center')}
          amount={loop.label.amount}
          asset={loop.label.asset}
          linkClassName={colorClass.text}
          short={true}
        />
      )}
    </>
  )
}

const RenderTransactionVector = fixedForwardRef(
  (
    {
      transaction,
      vector,
      bgClassName,
      ...rest
    }: {
      transaction: Transaction | InnerTransaction
      vector: Vector
      bgClassName: string
    },
    ref?: React.LegacyRef<HTMLDivElement>
  ) => {
    const colorClass = colorClassMap[transaction.type]

    return (
      <div
        className={cn('flex items-center justify-center z-10 relative', colorClass.text)}
        style={{
          // 2 and 3 are the number to offset the name column
          gridColumnStart: vector.fromVerticalIndex + 2,
          gridColumnEnd: vector.toVerticalIndex + 3,
        }}
        ref={ref}
        {...rest}
      >
        <Circle
          className={cn(colorClass.border, bgClassName)}
          text={vector.direction === 'leftToRight' ? vector.fromAccountIndex : vector.toAccountIndex}
        />
        <div
          style={{
            width: `calc(${(100 - 100 / (vector.toVerticalIndex - vector.fromVerticalIndex + 1)).toFixed(2)}% - ${graphConfig.circleDimension}px)`,
            height: `${graphConfig.circleDimension}px`,
          }}
          className="relative"
        >
          {vector.direction === 'rightToLeft' && (
            <span className="absolute left-0 top-0">
              <PointerLeft />
            </span>
          )}
          <div
            className={cn(colorClass.border)}
            style={{
              height: `calc(50% + ${graphConfig.lineWidth / 2}px)`,
              borderBottomWidth: graphConfig.lineWidth,
              margin: vector.direction === 'leftToRight' ? '0 1px 0 0' : '0 0 0 1px',
            }}
          ></div>
          {vector.direction === 'leftToRight' && (
            <span className="absolute right-0 top-0">
              <PointerRight />
            </span>
          )}
        </div>
        <div className="absolute flex max-w-[35%] justify-center ">
          <div className={cn('z-20 p-0.5 text-xs text-center w-full', bgClassName)}>
            <VectorLabel transaction={transaction} vector={vector} />
          </div>
        </div>
        <Circle
          className={cn(colorClass.border, bgClassName)}
          text={vector.direction === 'leftToRight' ? vector.toAccountIndex : vector.fromAccountIndex}
        />
      </div>
    )
  }
)
const RenderTransactionSelfLoop = fixedForwardRef(
  (
    {
      transaction,
      loop,
      bgClassName,
      ...rest
    }: {
      transaction: Transaction | InnerTransaction
      loop: SelfLoop
      bgClassName: string
    },
    ref?: React.LegacyRef<HTMLDivElement>
  ) => {
    const colorClass = colorClassMap[transaction.type]

    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-center relative z-10', colorClass.text)}
        {...rest}
        style={{
          gridColumnStart: loop.fromVerticalIndex + 2, // 2 to offset the name column
          gridColumnEnd: loop.fromVerticalIndex + 4, // 4 to offset the name column and make this cell span 2 columns
        }}
      >
        <Circle
          className={cn(colorClass.border, 'z-10', bgClassName)}
          text={loop.fromAccountIndex === loop.toAccountIndex ? loop.fromAccountIndex : undefined}
        />
        <div
          style={{
            width: `50%`,
            height: `${graphConfig.circleDimension}px`,
          }}
        >
          <SvgPointerLeft className={cn('relative')} style={{ left: `calc(50% + ${graphConfig.circleDimension})px` }} />
        </div>
        <div
          className={cn('absolute size-1/2', colorClass.border)}
          style={{
            borderWidth: graphConfig.lineWidth,
            borderRadius: '4px',
            bottom: graphConfig.lineWidth / 2,
            right: `25%`,
          }}
        ></div>
        <div className={cn('absolute flex w-1/2 justify-center text-xs')}>
          <div className={cn('z-20 p-0.5 text-xs text-center', bgClassName)}>
            <SelfLoopLabel transaction={transaction} loop={loop} />
          </div>
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
      bgClassName,
      ...rest
    }: {
      transaction: Transaction | InnerTransaction
      point: Point
      bgClassName: string
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
        <Circle className={cn(colorClass.border, bgClassName)} />
      </div>
    )
  }
)

type Props = {
  horizontal: HorizontalModel
  verticals: Vertical[]
  bgClassName: string
  isSimulated: boolean
}
export function Horizontal({ horizontal, verticals, bgClassName, isSimulated }: Props) {
  const { transaction, representation, ancestors, isSubHorizontal } = horizontal

  return (
    <>
      <div className={cn('p-0 relative')}>
        <ConnectionsFromAncestorsToAncestorsNextSiblings ancestors={ancestors} />
        {!isSubHorizontal && <HorizontalTitle horizontal={horizontal} isSimulated={isSimulated} />}
        {isSubHorizontal && <SubHorizontalTitle horizontal={horizontal} />}
      </div>
      {verticals.map((_, index) => {
        if (
          representation.type === RepresentationType.Vector &&
          (index < representation.fromVerticalIndex || index > representation.toVerticalIndex)
        ) {
          return <div key={index}></div>
        }
        if (representation.type === RepresentationType.Point && index > representation.fromVerticalIndex) return <div key={index}></div>
        // The `index > representation.fromVerticalIndex + 1` is here
        // because a self-loop vector is rendered across 2 grid cells (see RenderTransactionSelfLoop).
        // Therefore, we skip this cell so that we won't cause overflowing
        if (representation.type === RepresentationType.SelfLoop && index > representation.fromVerticalIndex + 1)
          return <div key={index}></div>

        if (index === representation.fromVerticalIndex)
          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                {representation.type === RepresentationType.Vector ? (
                  <RenderTransactionVector key={index} vector={representation} transaction={transaction} bgClassName={bgClassName} />
                ) : representation.type === RepresentationType.SelfLoop ? (
                  <RenderTransactionSelfLoop key={index} loop={representation} transaction={transaction} bgClassName={bgClassName} />
                ) : representation.type === RepresentationType.Point ? (
                  <RenderTransactionPoint key={index} point={representation} transaction={transaction} bgClassName={bgClassName} />
                ) : null}
              </TooltipTrigger>
              <TooltipContent>
                {transaction.type === TransactionType.Payment && (
                  <PaymentTransactionTooltipContent transaction={transaction} isSimulated={isSimulated} />
                )}
                {transaction.type === TransactionType.AssetTransfer && (
                  <AssetTransferTransactionTooltipContent transaction={transaction} isSimulated={isSimulated} />
                )}
                {transaction.type === TransactionType.AppCall && (
                  <AppCallTransactionTooltipContent transaction={transaction} isSimulated={isSimulated} />
                )}
                {transaction.type === TransactionType.AssetConfig && (
                  <AssetConfigTransactionTooltipContent transaction={transaction} isSimulated={isSimulated} />
                )}
                {transaction.type === TransactionType.AssetFreeze && (
                  <AssetFreezeTransactionTooltipContent transaction={transaction} isSimulated={isSimulated} />
                )}
                {transaction.type === TransactionType.KeyReg && (
                  <KeyRegTransactionTooltipContent transaction={transaction} isSimulated={isSimulated} />
                )}
                {transaction.type === TransactionType.StateProof && (
                  <StateProofTransactionTooltipContent transaction={transaction} isSimulated={isSimulated} />
                )}
              </TooltipContent>
            </Tooltip>
          )
        return null
      })}
    </>
  )
}
