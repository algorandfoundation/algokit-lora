import SvgCircle from '@/features/common/components/svg/circle'
import SvgPointerLeft from '@/features/common/components/svg/pointer-left'
import SvgPointerRight from '@/features/common/components/svg/pointer-right'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/features/common/components/tooltip'
import { cn } from '@/features/common/utils'
import { fixedForwardRef } from '@/utils/fixed-forward-ref'
import { isDefined } from '@/utils/is-defined'
import { useMemo } from 'react'

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

function TransactionName({ hasParent, name }: { hasParent: boolean; name: string }) {
  return (
    <div
      className={cn('inline')}
      style={{
        marginLeft: hasParent ? `${graphConfig.indentationWidth + 8}px` : `16px`,
      }}
    >
      {name}
    </div>
  )
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

const DisplayArrow = fixedForwardRef(({ arrow, ...rest }: { arrow: Arrow }, ref?: React.LegacyRef<HTMLDivElement>) => {
  return (
    <div
      className={cn('flex items-center justify-center')}
      style={{
        // 2 and 3 are the number to offset the name column
        gridColumnStart: arrow.from + 2,
        gridColumnEnd: arrow.to + 3,
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
        className="relative text-primary"
      >
        {arrow.direction === 'rightToLeft' && <SvgPointerLeft className={cn('absolute top-0 left-0')} />}
        <div className={cn('border-primary h-1/2')} style={{ borderBottomWidth: graphConfig.lineWidth }}></div>
        {arrow.direction === 'leftToRight' && <SvgPointerRight className={cn('absolute top-0 right-0')} />}
      </div>
      <SvgCircle width={graphConfig.circleDimension} height={graphConfig.circleDimension}></SvgCircle>
    </div>
  )
})

const DisplaySelfTransaction = fixedForwardRef((props: object, ref?: React.LegacyRef<HTMLDivElement>) => {
  return (
    <div ref={ref} className={cn('flex items-center justify-center')} {...props}>
      <SvgCircle width={graphConfig.circleDimension} height={graphConfig.circleDimension}></SvgCircle>
    </div>
  )
})

type TransactionRowProps = {
  transaction: Transaction
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
          <TransactionName hasParent={hasParent} name={transaction.name} />
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
                <div className={cn('p-4')}>Transaction: {transaction.name}</div>
              </TooltipContent>
            </Tooltip>
          )
        if (index === arrow.from)
          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <DisplayArrow key={index} arrow={arrow} />
              </TooltipTrigger>
              <TooltipContent>
                <div className={cn('p-4')}>Transaction: {transaction.name}</div>
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

export function GroupPage() {
  const group: Group = {
    transactions: [
      { name: '7VSN...', sender: 'Account 4', receiver: 'Account 2' },
      {
        name: 'NDQX...',
        sender: 'Account 1',
        receiver: 'Account 2',
        transactions: [
          { name: 'Inner 1', sender: 'Account 1', receiver: 'Account 3' },
          {
            name: 'Inner 2',
            sender: 'Account 2',
            receiver: 'Account 5',
            transactions: [
              { name: 'Inner 3', sender: 'Account 5', receiver: 'Account 1' },
              {
                name: 'Inner 11',
                sender: 'Account 3',
                receiver: 'Account 1',
                transactions: [
                  { name: 'Inner 10', sender: 'Account 2', receiver: 'Account 6' },
                  { name: 'Inner 10', sender: 'Account 2', receiver: 'Account 6' },
                ],
              },
              {
                name: 'Inner 5',
                sender: 'Account 3',
                receiver: 'Account 1',
                transactions: [
                  {
                    name: 'Inner 10',
                    sender: 'Account 2',
                    receiver: 'Account 6',
                    transactions: [{ name: 'Inner 12', sender: 'Account 5', receiver: 'Account 6' }],
                  },
                ],
              },
              {
                name: 'Inner 6',
                sender: 'Account 3',
                receiver: 'Account 1',
              },
            ],
          },
          { name: 'Inner 9', sender: 'Account 2', receiver: 'Account 6' },
          {
            name: 'Inner 4',
            sender: 'Account 1',
            receiver: 'Account 1',
            transactions: [
              { name: 'Inner 6', sender: 'Account 3', receiver: 'Account 2' },
              {
                name: 'Inner 7',
                sender: 'Account 4',
                receiver: 'Account 2',
              },
            ],
          },
          { name: 'Inner 8', sender: 'Account 5', receiver: 'Account 3' },
        ],
      },
    ],
  }
  const { transactionCount, accounts } = extractSendersAndReceivers(group)

  return (
    <div
      className={cn('relative grid')}
      style={{
        gridTemplateColumns: `minmax(${graphConfig.colWidth}px, 1fr) repeat(${accounts.length}, ${graphConfig.colWidth}px)`,
        gridTemplateRows: `repeat(${transactionCount + 1}, ${graphConfig.rowHeight}px)`,
      }}
    >
      <div>{/* The first header cell is empty */}</div>
      {accounts.map((account, index) => (
        <div className={cn('p-2 flex justify-center')} key={index}>
          <h1 className={cn('text-l font-semibold')}> {account}</h1>
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
      {group.transactions.map((transaction, index, arr) => (
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

export type Group = {
  transactions: Transaction[]
}

export type Transaction = {
  name: string
  transactions?: Transaction[]
  sender: string
  receiver: string
}

function extractSendersAndReceivers(group: Group) {
  let transactionCount = 0
  let accounts: string[] = []

  function extract(transactionArr: Transaction[]) {
    if (transactionArr) {
      transactionArr.forEach((transaction) => {
        transactionCount++
        accounts.push(transaction.sender)
        accounts.push(transaction.receiver)
        if (transaction.transactions) {
          extract(transaction.transactions)
        }
      })
    }
  }

  extract(group.transactions)

  // Remove duplicates
  accounts = Array.from(new Set(accounts))
  // Sort
  accounts = accounts.sort((a, b) => (a > b ? 1 : a < b ? -1 : 0))

  return {
    transactionCount: transactionCount,
    accounts: accounts,
  }
}

function calcArrow(transaction: Transaction, accounts: string[]): Arrow {
  const fromAccount = accounts.findIndex((a) => transaction.sender === a)
  const toAccount = accounts.findIndex((a) => transaction.receiver === a)
  const direction = fromAccount < toAccount ? 'leftToRight' : fromAccount > toAccount ? 'rightToLeft' : 'toSelf'

  return {
    from: Math.min(fromAccount, toAccount),
    to: Math.max(fromAccount, toAccount),
    direction: direction,
  }
}

const graphConfig = {
  rowHeight: 40,
  colWidth: 128,
  indentationWidth: 20,
  lineWidth: 2,
  circleDimension: 20,
}
