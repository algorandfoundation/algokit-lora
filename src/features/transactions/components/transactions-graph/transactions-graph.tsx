import SvgCircle from '@/features/common/components/svg/circle'
import SvgPointerLeft from '@/features/common/components/svg/pointer-left'
import SvgPointerRight from '@/features/common/components/svg/pointer-right'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/features/common/components/tooltip'
import { cn } from '@/features/common/utils'
import { fixedForwardRef } from '@/utils/fixed-forward-ref'
import { isDefined } from '@/utils/is-defined'
import { useMemo } from 'react'
import { AppCallTransaction, InnerAppCallTransaction, InnerTransaction, Transaction, TransactionType } from '../../models'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { DisplayAssetAmount } from '@/features/common/components/display-asset-amount'
import { InnerTransactionLink } from '../inner-transaction-link'
import { TransactionLink } from '../transaction-link'
import { flattenInnerTransactions } from '@/utils/flatten-inner-transactions'
import { AccountLink } from '@/features/accounts/components/account-link'
import { ApplicationLink } from '@/features/applications/components/application-link'
import { AssetIdLink } from '@/features/assets/components/asset-link'
import { getApplicationAddress } from 'algosdk'
import { distinct } from '@/utils/distinct'
import { PaymentTransactionToolTipContent } from './payment-transaction-tool-tip-content'
import { AssetTransferTransactionToolTipContent } from './asset-transfer-transaction-tool-tip-content'
import { AppCallTransactionToolTipContent } from './app-call-transaction-tool-tip-content'
import { AssetConfigTransactionToolTipContent } from './asset-config-transaction-tool-tip-content'
import { AssetFreezeTransactionToolTipContent } from './asset-freeze-transaction-tool-tip-content'
import { KeyRegTransactionToolTipContent } from './key-reg-transaction-tool-tip-content'

const graphConfig = {
  rowHeight: 40,
  colWidth: 128,
  indentationWidth: 20,
  lineWidth: 2,
  circleDimension: 20,
  paymentTransactionColor: 'rgb(126 200 191)',
}

type TransactionVector = {
  from: number
  to: number
  type: 'vector'
  direction: 'leftToRight' | 'rightToLeft'
}

type TransactionSelfLoop = {
  from: number
  type: 'selfLoop'
}

type TransactionPoint = {
  type: 'point'
  from: number
}

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
      return <InnerTransactionLink transactionId={transaction.networkTransactionId} innerTransactionId={transaction.innerId} />
    }
    return <TransactionLink transactionId={transaction.id} short={true} />
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
      {collaborator.type === 'Account' && <AccountLink address={collaborator.address} short={true} />}
      {collaborator.type === 'Application' && (
        <div className={cn('grid')}>
          <ApplicationLink applicationId={parseInt(collaborator.id)} />
          {collaborator.addresses.map((address) => (
            <AccountLink key={address} address={address} short={true} />
          ))}
        </div>
      )}
      {collaborator.type === 'Asset' && <AssetIdLink assetId={parseInt(collaborator.id)} />}
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

const RenderTransactionVector = fixedForwardRef(
  (
    { transaction, vector, ...rest }: { transaction: Transaction | InnerTransaction; vector: TransactionVector },
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
    { transaction, loop, ...rest }: { transaction: Transaction | InnerTransaction; loop: TransactionSelfLoop },
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
    { transaction, point, ...rest }: { transaction: Transaction | InnerTransaction; point: TransactionPoint },
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

type TransactionGraphProps = {
  transaction: Transaction | InnerTransaction
  parent?: AppCallTransaction | InnerAppCallTransaction
  hasNextSibling?: boolean
  hasChildren?: boolean
  collaborators: Collaborator[]
  indentLevel?: number
  verticalBars: (number | undefined)[]
}
function TransactionGraph({
  transaction,
  collaborators,
  parent,
  hasNextSibling = false,
  indentLevel,
  verticalBars,
}: TransactionGraphProps) {
  const transactionRepresentation = useMemo(
    () => getTransactionRepresentation(transaction, collaborators, parent),
    [collaborators, parent, transaction]
  )
  const hasParent = !!parent
  const hasChildren = transaction.type === TransactionType.ApplicationCall && transaction.innerTransactions.length > 0

  return (
    <>
      <div className={cn('p-0 relative pr-8')}>
        <VerticalBars verticalBars={verticalBars} />
        <div
          className={cn(`relative h-full p-0 flex items-center`, 'px-0')}
          style={{ marginLeft: (indentLevel ?? 0) * graphConfig.indentationWidth }}
        >
          {parent && <ConnectionToParent />}
          <TransactionId hasParent={hasParent} transaction={transaction} />
          {hasParent && hasNextSibling && <ConnectionToSibling />}
          {hasChildren && <ConnectionToChildren indentLevel={indentLevel} />}
        </div>
      </div>
      {collaborators.map((_, index) => {
        if (
          transactionRepresentation.type === 'vector' &&
          (index < transactionRepresentation.from || index > transactionRepresentation.to)
        ) {
          return <div key={index}></div>
        }
        if (transactionRepresentation.type === 'point' && index > transactionRepresentation.from) return <div key={index}></div>
        // The `index > transactionRepresentation.from + 1` is here
        // because a self-loop vector is renderred across 2 grid cells (see RenderTransactionSelfLoop).
        // Therefore, we skip this cell so that we won't cause overflowing
        if (transactionRepresentation.type === 'selfLoop' && index > transactionRepresentation.from + 1) return <div key={index}></div>

        if (index === transactionRepresentation.from)
          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                {transactionRepresentation.type === 'vector' ? (
                  <RenderTransactionVector key={index} vector={transactionRepresentation} transaction={transaction} />
                ) : transactionRepresentation.type === 'selfLoop' ? (
                  <RenderTransactionSelfLoop key={index} loop={transactionRepresentation} transaction={transaction} />
                ) : transactionRepresentation.type === 'point' ? (
                  <RenderTransactionPoint key={index} point={transactionRepresentation} transaction={transaction} />
                ) : null}
              </TooltipTrigger>
              <TooltipContent>
                {transaction.type === TransactionType.Payment && <PaymentTransactionToolTipContent transaction={transaction} />}
                {transaction.type === TransactionType.AssetTransfer && <AssetTransferTransactionToolTipContent transaction={transaction} />}
                {transaction.type === TransactionType.ApplicationCall && <AppCallTransactionToolTipContent transaction={transaction} />}
                {transaction.type === TransactionType.AssetConfig && <AssetConfigTransactionToolTipContent transaction={transaction} />}
                {transaction.type === TransactionType.AssetFreeze && <AssetFreezeTransactionToolTipContent transaction={transaction} />}
                {transaction.type === TransactionType.KeyReg && <KeyRegTransactionToolTipContent transaction={transaction} />}
              </TooltipContent>
            </Tooltip>
          )
        return null
      })}

      {hasChildren &&
        transaction.innerTransactions.map((childTransaction, index, arr) => (
          <TransactionGraph
            key={index}
            transaction={childTransaction}
            parent={transaction}
            hasNextSibling={index < arr.length - 1}
            collaborators={collaborators}
            indentLevel={indentLevel == null ? 0 : indentLevel + 1}
            verticalBars={[...(verticalBars ?? []), hasNextSibling ? indentLevel ?? 0 : undefined]}
          />
        ))}
    </>
  )
}

function getTransactionRepresentation(
  transaction: Transaction | InnerTransaction,
  collaborators: Collaborator[],
  parent?: AppCallTransaction | InnerAppCallTransaction
): TransactionVector | TransactionSelfLoop | TransactionPoint {
  const calculateTo = () => {
    if (transaction.type === TransactionType.AssetTransfer || transaction.type === TransactionType.Payment) {
      return collaborators.findIndex((c) => c.type === 'Account' && transaction.receiver === c.address)
    }

    if (transaction.type === TransactionType.ApplicationCall) {
      return collaborators.findIndex((c) => c.type === 'Application' && transaction.applicationId.toString() === c.id)
    }

    if (transaction.type === TransactionType.AssetConfig) {
      return collaborators.findIndex((c) => c.type === 'Asset' && transaction.assetId.toString() === c.id)
    }

    if (transaction.type === TransactionType.AssetFreeze) {
      return collaborators.findIndex((c) => c.type === 'Account' && transaction.address.toString() === c.address)
    }

    throw new Error('Not supported transaction type')
  }

  // TODO: why?
  const from = !parent
    ? collaborators.findIndex(
        (c) =>
          (c.type === 'Account' && transaction.sender === c.address) ||
          (c.type === 'Application' && c.addresses.includes(transaction.sender))
      )
    : collaborators.findIndex((c) => c.type === 'Application' && c.id === parent.applicationId.toString())
  if (transaction.type === TransactionType.KeyReg) {
    return {
      from: from,
      type: 'point',
    } satisfies TransactionPoint
  }

  const to = calculateTo()
  if (from === to) {
    return {
      from: from,
      type: 'selfLoop',
    } satisfies TransactionSelfLoop
  }

  const direction = from < to ? 'leftToRight' : 'rightToLeft'

  return {
    from: Math.min(from, to),
    to: Math.max(from, to),
    direction: direction,
    type: 'vector',
  } satisfies TransactionVector
}

type Props = {
  transactions: Transaction[] | InnerTransaction[]
}

export function TransactionsGraph({ transactions }: Props) {
  const flattenedTransactions = useMemo(() => transactions.flatMap((transaction) => flattenInnerTransactions(transaction)), [transactions])

  const transactionCount = flattenedTransactions.length
  const collaborators: Collaborator[] = [
    ...getTransactionsCollaborators(flattenedTransactions.map((t) => t.transaction)),
    {
      type: 'Placeholder',
    }, // an empty account to make room to show transactions with the same sender and receiver
  ]
  // When there are applications, the header height is increased to make room for the application address
  const headerHeight = collaborators.some((c) => c.type === 'Application') ? graphConfig.rowHeight * 1.5 : graphConfig.rowHeight
  const maxNestingLevel = Math.max(...flattenedTransactions.map((t) => t.nestingLevel))
  const gridCollaboratorColumns = collaborators.length
  const firstColumnWidth = graphConfig.colWidth + maxNestingLevel * graphConfig.indentationWidth

  return (
    <div
      className={cn('relative grid')}
      style={{
        gridTemplateColumns: `minmax(${firstColumnWidth}px, ${firstColumnWidth}px) repeat(${gridCollaboratorColumns}, ${graphConfig.colWidth}px)`,
        gridTemplateRows: `${headerHeight}px repeat(${transactionCount}, ${graphConfig.rowHeight}px)`,
      }}
    >
      <div>{/* The first header cell is empty */}</div>
      {collaborators.map((collaborator, index) => (
        <div className={cn('p-2 flex justify-center')} key={index}>
          <CollaboratorId collaborator={collaborator} />
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
                .filter((a) => a.type !== 'Placeholder') // Don't need to draw for the empty collaborator
                .map((_, index) => (
                  <div key={index} className={cn('flex justify-center')}>
                    <div className={cn('border-muted h-full border-dashed')} style={{ borderLeftWidth: graphConfig.lineWidth }}></div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
      {transactions.map((transaction, index) => (
        <TransactionGraph key={index} transaction={transaction} parent={undefined} collaborators={collaborators} verticalBars={[]} />
      ))}
    </div>
  )
}

const getTransactionsCollaborators = (transactions: Transaction[] | InnerTransaction[]): Collaborator[] => {
  const collaborators = transactions.flatMap(getTransactionCollaborators)
  return collaborators.reduce<Collaborator[]>(
    (acc, current, _, array) => {
      if (current.type === 'Account') {
        if (acc.some((c) => c.type === 'Account' && c.address === current.address)) {
          return acc
        }

        return [...acc, current]
      }
      if (current.type === 'Application') {
        const index = acc.findIndex((c) => c.type === 'Application' && c.id === current.id)

        if (index > -1) {
          const newFoo = {
            type: 'Application' as const,
            id: current.id,
            addresses: [...(acc[index] as Application).addresses, ...current.addresses].filter(distinct((x) => x)),
          }
          acc.splice(index, 1, newFoo)
          return acc
        } else {
          return [...acc, current]
        }
      }
      if (current.type === 'Asset') {
        if (acc.some((c) => c.type === 'Asset' && c.id === current.id)) {
          return acc
        }
        return [...acc, current]
      } else return acc
    },
    [collaborators[0]] // TODO: why?
  )
}

const getTransactionCollaborators = (transaction: Transaction | InnerTransaction): Collaborator[] => {
  const collaborators: Collaborator[] = [
    {
      type: 'Account',
      address: transaction.sender,
    },
  ]
  if (transaction.type === TransactionType.Payment || transaction.type === TransactionType.AssetTransfer) {
    collaborators.push({
      type: 'Account',
      address: transaction.receiver,
    })
  }
  if (transaction.type === TransactionType.ApplicationCall) {
    collaborators.push({
      type: 'Application',
      id: transaction.applicationId.toString(),
      addresses: [
        getApplicationAddress(transaction.applicationId),
        ...transaction.innerTransactions.flatMap((innerTransaction) => innerTransaction.sender),
      ].filter(distinct((x) => x)),
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
      type: 'Account',
      address: transaction.address.toString(),
    })
  }
  return collaborators
}

type Account = {
  type: 'Account'
  address: string
}
type Application = {
  type: 'Application'
  id: string
  addresses: string[]
}
type Asset = {
  type: 'Asset'
  id: string
}
type Collaborator = Account | Application | Asset | { type: 'Placeholder' }