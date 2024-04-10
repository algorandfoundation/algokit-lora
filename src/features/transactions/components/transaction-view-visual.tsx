import SvgCircle from '@/features/common/components/svg/circle'
import SvgPointerLeft from '@/features/common/components/svg/pointer-left'
import SvgPointerRight from '@/features/common/components/svg/pointer-right'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/features/common/components/tooltip'
import { cn } from '@/features/common/utils'
import { fixedForwardRef } from '@/utils/fixed-forward-ref'
import { isDefined } from '@/utils/is-defined'
import { useMemo } from 'react'
import { TransactionModel, TransactionType } from '../models'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { DescriptionList } from '@/features/common/components/description-list'
import { ellipseAddress } from '@/utils/ellipse-address'
import { transactionPageConstants } from '@/features/theme/constant'

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

function TransactionId({ hasParent, id }: { hasParent: boolean; id: string }) {
  return (
    <div
      className={cn('inline')}
      style={{
        marginLeft: hasParent ? `${graphConfig.indentationWidth + 8}px` : `16px`,
      }}
    >
      {ellipseAddress(id)}
    </div>
  )
}

function AccountId({ id }: { id: string }) {
  return <h1 className={cn('text-l font-semibold')}>{ellipseAddress(id)}</h1>
}

function ConnectionToSibbling() {
  // The connection between this transaction and the next sibbling
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
  ({ transaction, arrow, ...rest }: { transaction: TransactionModel; arrow: Arrow }, ref?: React.LegacyRef<HTMLDivElement>) => {
    const color = graphConfig.paymentTransactionColor

    return (
      <div
        className={cn('flex items-center justify-center')}
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
        {transaction.type === TransactionType.Payment && (
          <div className={cn('absolute z-20 bg-card p-2 text-foreground w-20 text-xs')}>
            Payment
            <DisplayAlgo amount={transaction.amount} />
          </div>
        )}
        <SvgCircle width={graphConfig.circleDimension} height={graphConfig.circleDimension}></SvgCircle>
      </div>
    )
  }
)

const DisplaySelfTransaction = fixedForwardRef((props: object, ref?: React.LegacyRef<HTMLDivElement>) => {
  return (
    <div ref={ref} className={cn('flex items-center justify-center')} {...props}>
      <SvgCircle width={graphConfig.circleDimension} height={graphConfig.circleDimension}></SvgCircle>
    </div>
  )
})

function PaymentTransactionToolTipContent({ transaction }: { transaction: TransactionModel }) {
  const items = useMemo(
    () => [
      {
        dt: transactionPageConstants.labels.transactionId,
        dd: transaction.id,
      },
      {
        dt: transactionPageConstants.labels.type,
        dd: 'Payment',
      },
      {
        dt: transactionPageConstants.labels.sender,
        dd: transaction.sender,
      },
      {
        dt: transactionPageConstants.labels.receiver,
        dd: transaction.receiver,
      },
      {
        dt: transactionPageConstants.labels.amount,
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

type TransactionRowProps = {
  transaction: TransactionModel
  hasParent?: boolean
  hasNextSibbling?: boolean
  hasChildren?: boolean
  accounts: string[]
  indentLevel?: number
  verticalBars: (number | undefined)[]
}
function TransactionRow({
  transaction,
  accounts,
  hasParent = false,
  hasNextSibbling = false,
  hasChildren = false,
  indentLevel,
  verticalBars,
}: TransactionRowProps) {
  const arrow = useMemo(() => calcArrow(transaction, accounts), [accounts, transaction])

  return (
    <>
      <div className={cn('p-0 relative pr-8')}>
        <VerticalBars verticalBars={verticalBars} />
        <div
          className={cn(`relative h-full p-0 flex items-center`, 'px-0')}
          style={{ marginLeft: (indentLevel ?? 0) * graphConfig.indentationWidth }}
        >
          {hasParent && <ConnectionToParent />}
          <TransactionId hasParent={hasParent} id={transaction.id} />
          {hasParent && hasNextSibbling && <ConnectionToSibbling />}
          {hasChildren && <ConnectionToChildren indentLevel={indentLevel} />}
        </div>
      </div>
      {accounts.map((_, index) => {
        if (index < arrow.from || index > arrow.to) return <div key={index}></div>
        if (index === arrow.from && index === arrow.to)
          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <DisplaySelfTransaction />
              </TooltipTrigger>
              <TooltipContent>
                {transaction.type === TransactionType.Payment && <PaymentTransactionToolTipContent transaction={transaction} />}
              </TooltipContent>
            </Tooltip>
          )
        if (index === arrow.from)
          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <DisplayArrow key={index} arrow={arrow} transaction={transaction} />
              </TooltipTrigger>
              <TooltipContent>
                {transaction.type === TransactionType.Payment && <PaymentTransactionToolTipContent transaction={transaction} />}
              </TooltipContent>
            </Tooltip>
          )
        else return null
      })}

      {hasChildren &&
        transaction.transactions?.map((childTransaction, index, arr) => (
          <TransactionRow
            key={index}
            transaction={childTransaction}
            hasChildren={childTransaction.transactions && childTransaction.transactions.length > 0}
            hasParent={true}
            hasNextSibbling={index < arr.length - 1}
            accounts={accounts}
            indentLevel={indentLevel == null ? 0 : indentLevel + 1}
            verticalBars={[...(verticalBars ?? []), hasNextSibbling ? indentLevel ?? 0 : undefined]}
          />
        ))}
    </>
  )
}

function unpackTransaction(transaction: TransactionModel, nestingLevel = 0) {
  let transactionCount = 1
  let accounts: string[] = []
  let maxNestingLevel = nestingLevel

  accounts.push(transaction.sender)
  if (transaction.type === TransactionType.Payment) {
    accounts.push(transaction.receiver)
  }

  transaction.transactions?.forEach((transaction) => {
    const {
      transactionCount: childTransactionCount,
      accounts: childAccounts,
      nestingLevel: childNestingLevel,
    } = unpackTransaction(transaction, nestingLevel + 1)

    transactionCount += childTransactionCount
    accounts = [...accounts, ...childAccounts]
    maxNestingLevel = Math.max(maxNestingLevel, childNestingLevel)
  })

  // Remove duplicates
  accounts = Array.from(new Set(accounts))

  return {
    transactionCount: transactionCount,
    accounts: accounts,
    nestingLevel: maxNestingLevel,
  }
}

function calcArrow(transaction: TransactionModel, accounts: string[]): Arrow {
  const fromAccount = accounts.findIndex((a) => transaction.sender === a)

  if (transaction.type !== TransactionType.Payment) {
    return {
      from: fromAccount,
      to: fromAccount,
      direction: 'toSelf',
    }
  }

  const toAccount = accounts.findIndex((a) => transaction.receiver === a)
  const direction = fromAccount < toAccount ? 'leftToRight' : fromAccount > toAccount ? 'rightToLeft' : 'toSelf'

  return {
    from: Math.min(fromAccount, toAccount),
    to: Math.max(fromAccount, toAccount),
    direction: direction,
  }
}

type Props = {
  transaction: TransactionModel
}

export function TransactionViewVisual({ transaction }: Props) {
  const { transactionCount, accounts, nestingLevel } = unpackTransaction(transaction)

  return (
    <div
      className={cn('relative grid')}
      style={{
        gridTemplateColumns: `minmax(${graphConfig.colWidth}px, ${graphConfig.colWidth + nestingLevel * graphConfig.indentationWidth}px) repeat(${accounts.length}, ${graphConfig.colWidth}px)`,
        gridTemplateRows: `repeat(${transactionCount + 1}, ${graphConfig.rowHeight}px)`,
      }}
    >
      <div>{/* The first header cell is empty */}</div>
      {accounts.map((account, index) => (
        <div className={cn('p-2 flex justify-center')} key={index}>
          <AccountId id={account} />
        </div>
      ))}
      {/* The below div is for drawing the background dash lines */}
      <div className={cn('absolute right-0 -z-10')} style={{ top: `${graphConfig.rowHeight}px` }}>
        <div>
          <div className={cn('p-0')}></div>
          <div
            className={cn('p-0')}
            style={{ height: `${transactionCount * graphConfig.rowHeight}px`, width: `${graphConfig.colWidth * accounts.length}px` }}
          >
            <div
              className={cn('grid h-full')}
              style={{
                gridTemplateColumns: `repeat(${accounts.length}, minmax(0, 1fr))`,
                height: `${transactionCount * graphConfig.rowHeight}px`,
              }}
            >
              {accounts.map((_, index) => (
                <div key={index} className={cn('flex justify-center')}>
                  <div className={cn('border-muted h-full border-dashed')} style={{ borderLeftWidth: graphConfig.lineWidth }}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <TransactionRow
        transaction={transaction}
        hasChildren={transaction.transactions && transaction.transactions.length > 0}
        hasParent={false}
        accounts={accounts}
        verticalBars={[]}
      />
      {transaction.transactions?.map((transaction, index, arr) => (
        <TransactionRow
          key={index}
          transaction={transaction}
          hasChildren={transaction.transactions && transaction.transactions.length > 0}
          hasParent={false}
          hasNextSibbling={index < arr.length - 1}
          accounts={accounts}
          verticalBars={[]}
        />
      ))}
    </div>
  )
}
