import { cn } from '@/features/common/utils'

type TransactionTrProps = {
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
function TransactionTr({
  transaction,
  accounts,
  hasParent = false,
  hasNextSibbling = false,
  hasChildren = false,
  indentLevel = 0,
  verticalBars,
}: TransactionTrProps) {
  return (
    <>
      <tr>
        <td className={cn('p-0 relative')}>
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
        {accounts.map((account, index) => (
          <td key={index} className={cn('p-0 relative')}>
            <div className={cn('h-10 border-l-2 border-muted border-dashed absolute left-[50%]')}></div>
          </td>
        ))}
      </tr>

      {hasChildren &&
        transaction.transactions?.map((childTransaction, index, arr) => (
          <TransactionTr
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

  return (
    <table className={cn('w-full')}>
      <tr>
        <th></th>
        {accounts.map((account, index) => (
          <th key={index}>{account}</th>
        ))}
      </tr>
      {group.transactions?.map((transaction, index, arr) => (
        <TransactionTr
          transaction={transaction}
          hasChildren={transaction.transactions && transaction.transactions.length > 0}
          hasParent={false}
          hasNextSibbling={index < arr.length - 1}
          accounts={accounts}
        />
      ))}
    </table>
  )
}

export type Group = {
  transactions?: Transaction[]
}

export type Transaction = {
  name: string
  transactions?: Transaction[]
  sender: string
  receiver: string
}

function extractSendersAndReceivers(group: Group): string[] {
  let sendersAndReceivers: string[] = []

  function extract(transactionArr: Transaction[] | undefined) {
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
