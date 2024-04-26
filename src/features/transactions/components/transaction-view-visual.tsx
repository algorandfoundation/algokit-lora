import SvgCircle from '@/features/common/components/svg/circle'
import SvgPointerLeft from '@/features/common/components/svg/pointer-left'
import SvgPointerRight from '@/features/common/components/svg/pointer-right'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/features/common/components/tooltip'
import { cn } from '@/features/common/utils'
import { fixedForwardRef } from '@/utils/fixed-forward-ref'
import { isDefined } from '@/utils/is-defined'
import { useMemo } from 'react'
import {
  AppCallTransaction,
  AssetConfigTransaction,
  AssetFreezeTransaction,
  AssetTransferTransaction,
  InnerAppCallTransaction,
  InnerAssetConfigTransaction,
  InnerAssetFreezeTransaction,
  InnerAssetTransferTransaction,
  InnerPaymentTransaction,
  InnerTransaction,
  PaymentTransaction,
  Transaction,
  TransactionType,
} from '../models'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { DescriptionList } from '@/features/common/components/description-list'
import { ellipseAddress } from '@/utils/ellipse-address'
import { flattenInnerTransactions } from '@/utils/flatten-inner-transactions'
import { transactionIdLabel, transactionTypeLabel } from './transaction-info'
import { ellipseId } from '@/utils/ellipse-id'
import { transactionAmountLabel, transactionReceiverLabel, transactionSenderLabel } from './transaction-view-table'
import { DisplayAssetAmount } from '@/features/common/components/display-asset-amount'
import { InnerTransactionLink } from './inner-transaction-link'
import { assetIdLabel } from './asset-config-transaction-info'
import { assetFreezeAddressLabel, assetFreezeStatusLabel } from './asset-freeze-transaction-info'

const graphConfig = {
  rowHeight: 40,
  colWidth: 128,
  indentationWidth: 20,
  lineWidth: 2,
  circleDimension: 20,
  paymentTransactionColor: 'rgb(126 200 191)',
}

type Arrow = {
  from: number
  to: number
  direction: 'leftToRight' | 'rightToLeft' | 'toSelf'
}

export const applicationIdLabel = 'Application Id'

function VerticalBars({ verticalBars }: { verticalBars: (number | undefined)[] }) {
  // The side vertical bars when there are nested items
  return (verticalBars ?? [])
    .filter(isDefined)
    .map((b, i) => (
      <div
        key={i}
        className={cn('h-full border-primary absolute')}
        style={{ marginLeft: b * graphConfig.indentationWidth, borderLeftWidth: `${graphConfig.lineWidth}px` }}
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

function TransactionId({ hasParent, transaction }: { hasParent: boolean; transaction: Transaction | InnerTransaction }) {
  const component = useMemo(() => {
    if ('innerId' in transaction) {
      return <InnerTransactionLink innerTransactionId={transaction.innerId}>Inner {transaction.innerId}</InnerTransactionLink>
    }
    return ellipseId(transaction.id)
  }, [transaction])

  return (
    <div
      className={cn('inline')}
      style={{
        marginLeft: hasParent ? `${graphConfig.indentationWidth + 8}px` : `16px`,
      }}
    >
      {component}
    </div>
  )
}

function CollaboratorId({ collaborator }: { collaborator: Collaborator }) {
  return (
    <h1 className={cn('text-l font-semibold')}>
      {collaborator.type === 'Account' && ellipseAddress(collaborator.id)}
      {collaborator.type !== 'Account' && collaborator.id}
    </h1>
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

function ConnectionToChildren({ indentLevel }: { indentLevel: number | undefined }) {
  // The connection between this transaction and the children
  return (
    <div
      className={cn('w-2', 'border-primary rounded-tl-lg', 'absolute left-0')}
      style={{
        marginLeft: indentLevel != null ? `${graphConfig.indentationWidth}px` : undefined,
        borderLeftWidth: `${graphConfig.lineWidth}px`,
        borderTopWidth: `${graphConfig.lineWidth}px`,
        height: `calc(50% + ${graphConfig.lineWidth}px)`,
        top: `calc(50% - ${graphConfig.lineWidth}px)`,
      }}
    ></div>
  )
}

const DisplayArrow = fixedForwardRef(
  (
    { transaction, arrow, ...rest }: { transaction: Transaction | InnerTransaction; arrow: Arrow },
    ref?: React.LegacyRef<HTMLDivElement>
  ) => {
    const color = graphConfig.paymentTransactionColor

    return (
      <div
        className={cn('flex items-center justify-center z-10')}
        style={{
          // 2 and 3 are the number to offset the name column
          gridColumnStart: arrow.from + 2,
          gridColumnEnd: arrow.to + 3,
          color: color,
        }}
        ref={ref}
        {...rest}
      >
        <SvgCircle width={graphConfig.circleDimension} height={graphConfig.circleDimension}></SvgCircle>
        <div
          style={{
            width: `calc(${(100 - 100 / (arrow.to - arrow.from + 1)).toFixed(2)}% - ${graphConfig.circleDimension}px)`,
            height: `${graphConfig.circleDimension}px`,
          }}
          className="relative"
        >
          {arrow.direction === 'rightToLeft' && <SvgPointerLeft className={cn('absolute top-0 left-0')} />}
          <div className={cn('h-1/2')} style={{ borderBottomWidth: graphConfig.lineWidth, borderColor: color }}></div>
          {arrow.direction === 'leftToRight' && <SvgPointerRight className={cn('absolute top-0 right-0')} />}
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

const DisplaySelfTransaction = fixedForwardRef(
  (
    { transaction, arrow, ...rest }: { transaction: Transaction | InnerTransaction; arrow: Arrow },
    ref?: React.LegacyRef<HTMLDivElement>
  ) => {
    const color = graphConfig.paymentTransactionColor

    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-center relative z-10')}
        {...rest}
        style={{
          gridColumnStart: arrow.from + 2, // 2 to offset the name column
          gridColumnEnd: arrow.to + 4, // 4 to offset the name column and make this cell span 2 columns
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

function PaymentTransactionToolTipContent({ transaction }: { transaction: PaymentTransaction | InnerPaymentTransaction }) {
  const items = useMemo(
    () => [
      {
        dt: transactionIdLabel,
        dd: transaction.id,
      },
      {
        dt: transactionTypeLabel,
        dd: 'Payment',
      },
      {
        dt: transactionSenderLabel,
        dd: transaction.sender,
      },
      {
        dt: transactionReceiverLabel,
        dd: transaction.receiver,
      },
      {
        dt: transactionAmountLabel,
        dd: <DisplayAlgo amount={transaction.amount} />,
      },
    ],
    [transaction.amount, transaction.id, transaction.receiver, transaction.sender]
  )

  return (
    <div className={cn('p-4')}>
      <DescriptionList items={items} />
    </div>
  )
}

function AssetTransferTransactionToolTipContent({
  transaction,
}: {
  transaction: AssetTransferTransaction | InnerAssetTransferTransaction
}) {
  const items = useMemo(
    () => [
      {
        dt: transactionIdLabel,
        dd: transaction.id,
      },
      {
        dt: transactionTypeLabel,
        dd: 'Asset Transfer',
      },
      {
        dt: transactionSenderLabel,
        dd: transaction.sender,
      },
      {
        dt: transactionReceiverLabel,
        dd: transaction.receiver,
      },
      {
        dt: transactionAmountLabel,
        dd: <DisplayAssetAmount asset={transaction.asset} amount={transaction.amount} />,
      },
    ],
    [transaction.amount, transaction.asset, transaction.id, transaction.receiver, transaction.sender]
  )

  return (
    <div className={cn('p-4')}>
      <DescriptionList items={items} />
    </div>
  )
}

function AppCallTransactionToolTipContent({ transaction }: { transaction: AppCallTransaction | InnerAppCallTransaction }) {
  const items = useMemo(
    () => [
      {
        dt: transactionIdLabel,
        dd: transaction.id,
      },
      {
        dt: transactionTypeLabel,
        dd: 'Application Call',
      },
      {
        dt: transactionSenderLabel,
        dd: transaction.sender,
      },
      {
        dt: applicationIdLabel,
        dd: transaction.applicationId,
      },
    ],
    [transaction.applicationId, transaction.id, transaction.sender]
  )

  return (
    <div className={cn('p-4')}>
      <DescriptionList items={items} />
    </div>
  )
}

function AssetConfigTransactionToolTipContent({ transaction }: { transaction: AssetConfigTransaction | InnerAssetConfigTransaction }) {
  const items = useMemo(
    () => [
      {
        dt: transactionIdLabel,
        dd: transaction.id,
      },
      {
        dt: transactionTypeLabel,
        dd: 'Asset Config',
      },
      {
        dt: transactionSenderLabel,
        dd: transaction.sender,
      },
      {
        dt: assetIdLabel,
        dd: transaction.assetId,
      },
    ],
    [transaction.assetId, transaction.id, transaction.sender]
  )

  return (
    <div className={cn('p-4')}>
      <DescriptionList items={items} />
    </div>
  )
}

function AssetFreezeTransactionToolTipContent({ transaction }: { transaction: AssetFreezeTransaction | InnerAssetFreezeTransaction }) {
  const items = useMemo(
    () => [
      {
        dt: transactionIdLabel,
        dd: transaction.id,
      },
      {
        dt: transactionTypeLabel,
        dd: TransactionType.AssetFreeze,
      },
      {
        dt: transactionSenderLabel,
        dd: transaction.sender,
      },
      {
        dt: assetIdLabel,
        dd: transaction.assetId,
      },
      {
        dt: assetFreezeAddressLabel,
        dd: transaction.address,
      },
      {
        dt: assetFreezeStatusLabel,
        dd: transaction.freezeStatus,
      },
    ],
    [transaction.address, transaction.assetId, transaction.freezeStatus, transaction.id, transaction.sender]
  )

  return (
    <div className={cn('p-4')}>
      <DescriptionList items={items} />
    </div>
  )
}

type TransactionRowProps = {
  transaction: Transaction | InnerTransaction
  hasParent?: boolean
  hasNextSibling?: boolean
  hasChildren?: boolean
  collaborators: Collaborator[]
  indentLevel?: number
  verticalBars: (number | undefined)[]
}
function TransactionRow({
  transaction,
  collaborators,
  hasParent = false,
  hasNextSibling = false,
  indentLevel,
  verticalBars,
}: TransactionRowProps) {
  const arrow = useMemo(() => calcArrow(transaction, collaborators), [collaborators, transaction])
  const hasChildren = transaction.type === TransactionType.ApplicationCall && transaction.innerTransactions.length > 0

  return (
    <>
      <div className={cn('p-0 relative pr-8')}>
        <VerticalBars verticalBars={verticalBars} />
        <div
          className={cn(`relative h-full p-0 flex items-center`, 'px-0')}
          style={{ marginLeft: (indentLevel ?? 0) * graphConfig.indentationWidth }}
        >
          {hasParent && <ConnectionToParent />}
          <TransactionId hasParent={hasParent} transaction={transaction} />
          {hasParent && hasNextSibling && <ConnectionToSibling />}
          {hasChildren && <ConnectionToChildren indentLevel={indentLevel} />}
        </div>
      </div>
      {collaborators.map((_, index) => {
        if (index < arrow.from || index > arrow.to) return <div key={index}></div>
        if (index === arrow.from)
          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                {index === arrow.to ? (
                  <DisplaySelfTransaction key={index} arrow={arrow} transaction={transaction} />
                ) : (
                  <DisplayArrow key={index} arrow={arrow} transaction={transaction} />
                )}
              </TooltipTrigger>
              <TooltipContent>
                {transaction.type === TransactionType.Payment && <PaymentTransactionToolTipContent transaction={transaction} />}
                {transaction.type === TransactionType.AssetTransfer && <AssetTransferTransactionToolTipContent transaction={transaction} />}
                {transaction.type === TransactionType.ApplicationCall && <AppCallTransactionToolTipContent transaction={transaction} />}
                {transaction.type === TransactionType.AssetConfig && <AssetConfigTransactionToolTipContent transaction={transaction} />}
                {transaction.type === TransactionType.AssetFreeze && <AssetFreezeTransactionToolTipContent transaction={transaction} />}
              </TooltipContent>
            </Tooltip>
          )
        return null
      })}

      {hasChildren &&
        transaction.innerTransactions.map((childTransaction, index, arr) => (
          <TransactionRow
            key={index}
            transaction={childTransaction}
            hasParent={true}
            hasNextSibling={index < arr.length - 1}
            collaborators={collaborators}
            indentLevel={indentLevel == null ? 0 : indentLevel + 1}
            verticalBars={[...(verticalBars ?? []), hasNextSibling ? indentLevel ?? 0 : undefined]}
          />
        ))}
    </>
  )
}

function calcArrow(transaction: Transaction | InnerTransaction, collaborators: Collaborator[]): Arrow {
  const calculateTo = () => {
    if (transaction.type === TransactionType.AssetTransfer || transaction.type === TransactionType.Payment) {
      return collaborators.findIndex((a) => transaction.receiver === a.id)
    }

    if (transaction.type === TransactionType.ApplicationCall) {
      return collaborators.findIndex((a) => transaction.applicationId.toString() === a.id)
    }

    if (transaction.type === TransactionType.AssetConfig) {
      return collaborators.findIndex((a) => transaction.assetId.toString() === a.id)
    }

    if (transaction.type === TransactionType.AssetFreeze) {
      return collaborators.findIndex((a) => transaction.assetId.toString() === a.id)
    }

    throw new Error('Not supported transaction type')
  }

  const from = collaborators.findIndex((a) => transaction.sender === a.id)
  const to = calculateTo()

  const direction = from < to ? 'leftToRight' : from > to ? 'rightToLeft' : 'toSelf'

  return {
    from: Math.min(from, to),
    to: Math.max(from, to),
    direction: direction,
  }
}

type Props = {
  transaction: Transaction | InnerTransaction
}

export function TransactionViewVisual({ transaction }: Props) {
  const flattenedTransactions = useMemo(() => flattenInnerTransactions(transaction), [transaction])
  const transactionCount = flattenedTransactions.length
  const collaborators: Collaborator[] = [
    ...getTransactionsCollaborators(flattenedTransactions.map((t) => t.transaction)),
    {
      type: 'Account',
      id: '',
    }, // an empty account to make room to show transactions with the same sender and receiver
  ]
  const maxNestingLevel = Math.max(...flattenedTransactions.map((t) => t.nestingLevel))
  const gridCollaboratorColumns = collaborators.length
  const firstColumnWidth = graphConfig.colWidth + maxNestingLevel * graphConfig.indentationWidth

  return (
    <div
      className={cn('relative grid')}
      style={{
        gridTemplateColumns: `minmax(${firstColumnWidth}px, ${firstColumnWidth}px) repeat(${gridCollaboratorColumns}, ${graphConfig.colWidth}px)`,
        gridTemplateRows: `repeat(${transactionCount + 1}, ${graphConfig.rowHeight}px)`,
      }}
    >
      <div>{/* The first header cell is empty */}</div>
      {collaborators.map((collaborator, index) => (
        <div className={cn('p-2 flex justify-center')} key={index}>
          <CollaboratorId collaborator={collaborator} />
        </div>
      ))}
      {/* The below div is for drawing the background dash lines */}
      <div className={cn('absolute left-0')} style={{ top: `${graphConfig.rowHeight}px` }}>
        <div>
          <div className={cn('p-0')}></div>
          <div
            className={cn('p-0')}
            style={{
              height: `${transactionCount * graphConfig.rowHeight}px`,
              width: `${graphConfig.colWidth * gridCollaboratorColumns}px`,
            }}
          >
            <div
              className={cn('grid h-full')}
              style={{
                gridTemplateColumns: `minmax(${firstColumnWidth}px, ${firstColumnWidth}px) repeat(${gridCollaboratorColumns}, ${graphConfig.colWidth}px)`,
                height: `${transactionCount * graphConfig.rowHeight}px`,
              }}
            >
              <div></div>
              {collaborators
                .filter((a) => a.id) // Don't need to draw for the empty collaborator
                .map((_, index) => (
                  <div key={index} className={cn('flex justify-center')}>
                    <div className={cn('border-muted h-full border-dashed')} style={{ borderLeftWidth: graphConfig.lineWidth }}></div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
      <TransactionRow transaction={transaction} hasParent={false} collaborators={collaborators} verticalBars={[]} />
    </div>
  )
}

const getTransactionsCollaborators = (transactions: Transaction[]): Collaborator[] => {
  return transactions.reduce((acc, transaction) => {
    const collaborators = getTransactionCollaborators(transaction)
    collaborators.forEach((collaborator) => {
      if (!acc.some((c) => c.type === collaborator.type && c.id === collaborator.id)) {
        acc.push(collaborator)
      }
    })
    return acc
  }, new Array<Collaborator>())
}

const getTransactionCollaborators = (transaction: Transaction | InnerTransaction): Collaborator[] => {
  const collaborators: Collaborator[] = [
    {
      type: 'Account',
      id: transaction.sender,
    },
  ]
  if (transaction.type === TransactionType.Payment || transaction.type === TransactionType.AssetTransfer) {
    collaborators.push({
      type: 'Account',
      id: transaction.receiver,
    })
  }
  if (transaction.type === TransactionType.ApplicationCall) {
    collaborators.push({
      type: 'Application',
      id: transaction.applicationId.toString(),
    })
  }
  if (transaction.type === TransactionType.AssetConfig) {
    collaborators.push({
      type: 'Asset',
      id: transaction.assetId.toString(),
    })
  }
  if (transaction.type === TransactionType.AssetFreeze) {
    collaborators.push({
      type: 'Asset',
      id: transaction.assetId.toString(),
    })
  }
  return collaborators
}

type Collaborator = {
  type: 'Account' | 'Application' | 'Asset'
  id: string
}
