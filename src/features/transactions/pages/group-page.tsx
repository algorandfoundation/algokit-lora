import SvgCircle from '@/features/common/components/svg/circle'
import { cn } from '@/features/common/utils'
import { useMemo, useState } from 'react'

type AccountFoo = {
  account: string
  // the status for the arrow only
  status: 'from' | 'to' | 'middle' | 'outside'
}

type TransactionFooDrawing = {
  from: number
  to: number
  direction: 'leftToRight' | 'rightToLeft' | 'toSelf'
}

type TransactionTableRowProps = {
  transaction: Transaction
  cellHeight?: number
  lineWidth?: number
  hasParent?: boolean
  hasNextSibbling?: boolean
  hasChildren?: boolean
  accounts: string[]
  indentLevel?: number
  verticalBars?: number[]
}
function TransactionTableRow({
  transaction,
  accounts,
  hasParent = false,
  hasNextSibbling = false,
  hasChildren = false,
  indentLevel = 0,
  verticalBars,
}: TransactionTableRowProps) {
  const foo = useMemo(() => calcTransactionFoo(transaction, accounts), [accounts, transaction])

  return (
    <>
      <tr>
        <td className={cn('p-0 relative -z-10')}>
          {verticalBars &&
            verticalBars.length &&
            verticalBars
              .filter((b) => b > 0)
              .map((b, i) => <div key={i} className={cn('h-10 border-primary border-l-2 absolute')} style={{ marginLeft: b * 16 }}></div>)}
          <div className={cn(`relative h-10 p-0 flex items-center`, 'px-0')} style={{ marginLeft: indentLevel * 16 }}>
            {hasParent && (
              <div className={cn('w-8', `border-primary border-l-2 border-b-2 rounded-bl-lg`, `h-[50%]`, `absolute top-0 left-0`)}></div>
            )}
            <div className={cn('inline ml-8')}>{transaction.name}</div>
            {hasParent && hasNextSibbling && (
              <div className={cn('w-8', 'border-primary border-l-2', 'h-[22px]', 'absolute top-[18px] left-0')}></div>
            )}
            {hasChildren && (
              <div
                className={cn('w-2 ml-4', 'border-primary border-l-2 border-t-2 rounded-tl-lg', 'h-[22px]', 'absolute top-[18px] left-0')}
              ></div>
            )}
          </div>
        </td>
        {accounts.map((account, index) => {
          if (index < foo.from || index > foo.to) return <td key={index}></td>
          if (index === foo.from)
            return (
              <td key={index} colSpan={foo.to - foo.from + 1}>
                <div className={cn('flex items-center justify-center bg-red-200')}>
                  <SvgCircle width={20} height={20}></SvgCircle>
                  <div
                    className={cn('border-primary border-b-2')}
                    style={{ width: `calc(${(100 - 100 / (foo.to - foo.from + 1)).toFixed(2)}% - 20px)` }}
                  ></div>
                  <SvgCircle width={20} height={20}></SvgCircle>
                </div>
              </td>
            )
          else return null
        })}
      </tr>
      {hasChildren &&
        transaction.transactions?.map((childTransaction, index, arr) => (
          <TransactionTableRow
            transaction={childTransaction}
            hasChildren={childTransaction.transactions && childTransaction.transactions.length > 0}
            hasParent={true}
            hasNextSibbling={index < arr.length - 1}
            accounts={accounts}
            indentLevel={indentLevel + 1}
            verticalBars={[...(verticalBars ?? []), hasNextSibbling ? indentLevel : 0]}
          />
        ))}
    </>
  )
}

export function GroupPage() {
  const group: Group = {
    transactions: [
      { name: '7VSN...', sender: 'Account 1', receiver: 'Account 2' },
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
                transactions: [{ name: 'Inner 10', sender: 'Account 2', receiver: 'Account 6' }],
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
  const accounts = extractSendersAndReceivers(group)
  const allTransactionCounts = 15
  return (
    <table className={cn('w-full')}>
      <tr>
        <th></th>
        {accounts.map((account, index) => (
          <th key={index}>{account}</th>
        ))}
      </tr>
      <tbody style={{ height: `${allTransactionCounts * 40}px` }}>
        <tr>
          <td></td>
          <td rowSpan={allTransactionCounts} colSpan={accounts.length} className={cn('p-0')}>
            <div
              className={cn('grid h-full')}
              style={{
                gridTemplateColumns: `repeat(${accounts.length}, minmax(0, 1fr))`,
                height: `${allTransactionCounts * 40}px`,
              }}
            >
              {accounts.map((account, index) => (
                <div key={index} className={cn('flex justify-center')}>
                  <div className={cn('border-muted border-l-2 h-full border-dashed')}></div>
                </div>
              ))}
            </div>
          </td>
        </tr>
      </tbody>
      <tbody className="relative" style={{ top: `-${15 * 40}px` }}>
        {group.transactions.map((transaction, index, arr) => (
          <TransactionTableRow
            transaction={transaction}
            hasChildren={transaction.transactions && transaction.transactions.length > 0}
            hasParent={false}
            hasNextSibbling={index < arr.length - 1}
            accounts={accounts}
          />
        ))}
      </tbody>
    </table>
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

function extractSendersAndReceivers(group: Group): string[] {
  let sendersAndReceivers: string[] = []

  function extract(transactionArr: Transaction[]) {
    if (transactionArr) {
      transactionArr.forEach((transaction) => {
        sendersAndReceivers.push(transaction.sender)
        sendersAndReceivers.push(transaction.receiver)
        if (transaction.transactions) {
          extract(transaction.transactions)
        }
      })
    }
  }

  extract(group.transactions)

  // Remove duplicates
  sendersAndReceivers = Array.from(new Set(sendersAndReceivers))

  return sendersAndReceivers
}

function calcTransactionFoo(transaction: Transaction, accounts: string[]): TransactionFooDrawing {
  const fromAccount = accounts.findIndex((a) => transaction.sender === a)
  const toAccount = accounts.findIndex((a) => transaction.receiver === a)
  const direction = fromAccount < toAccount ? 'leftToRight' : fromAccount > toAccount ? 'rightToLeft' : 'toSelf'

  return {
    from: Math.min(fromAccount, toAccount),
    to: Math.max(fromAccount, toAccount),
    direction: direction,
  }
}
