import { cn } from '@/features/common/utils'

type TransactionTrProps = {
  transaction: Transaction
  cellHeight?: number
  lineWidth?: number
  hasParent?: boolean
  hasNextSibbling?: boolean
  hasChildren?: boolean
}
function TransactionTr({ transaction, hasParent = false, hasNextSibbling = false, hasChildren = false }: TransactionTrProps) {
  return (
    <tr>
      <td className="p-0">
        <div className={cn(`relative h-10 p-0 flex items-center`, 'px-0')}>
          {hasParent && (
            <div className={cn('w-8', `border-primary border-l-2 border-b-2 rounded-bl-lg`, `h-[50%]`, `absolute top-0 left-0`)}></div>
          )}
          <div className={cn('inline ml-8')}>{transaction.name}</div>
          {hasParent && hasNextSibbling && (
            <div className={cn('w-8', 'border-primary border-l-2', 'h-[22px]', 'absolute top-[18px] left-0')}></div>
          )}
          {hasChildren && !hasParent && (
            <div
              className={cn(
                'w-8',
                `border-primary border-l-2 border-t-2 rounded-tl-lg`,
                `h-[calc(50%+2px)]`,
                `absolute top-[calc(50%-2px)] left-0`
              )}
            ></div>
          )}
          {hasChildren && hasParent && (
            <div
              className={cn('w-2 ml-4', 'border-primary border-l-2 border-t-2 rounded-tl-lg', 'h-[22px]', 'absolute top-[18px] left-0')}
            ></div>
          )}
        </div>
        {hasChildren && (
          <div className={cn('relative', hasParent ? 'pl-4' : '')}>
            {hasNextSibbling && <div className={cn(`border-primary border-l-2`, `h-full`, 'absolute top-0 left-0')}></div>}
            <table>
              {transaction.transactions?.map((childTransaction, index, arr) => (
                <TransactionTr
                  transaction={childTransaction}
                  hasChildren={childTransaction.transactions && childTransaction.transactions.length > 0}
                  hasParent={true}
                  hasNextSibbling={index < arr.length - 1}
                />
              ))}
            </table>
          </div>
        )}
      </td>
      <td></td>
    </tr>
  )
}

export function GroupPage() {
  const group: Transaction = {
    name: '',
    transactions: [
      { name: '7VSN...' },
      {
        name: 'NDQX...',
        transactions: [
          { name: 'Inner 1' },
          { name: 'Inner 2', transactions: [{ name: 'Inner 3' }, { name: 'Inner 5' }] },
          { name: 'Inner 9' },
          { name: 'Inner 4', transactions: [{ name: 'Inner 6' }, { name: 'Inner 7' }] },
          { name: 'Inner 8' },
        ],
      },
    ],
  }

  return (
    <table>
      {group.transactions?.map((transaction, index, arr) => (
        <TransactionTr
          transaction={transaction}
          hasChildren={transaction.transactions && transaction.transactions.length > 0}
          hasParent={false}
          hasNextSibbling={index < arr.length - 1}
        />
      ))}
    </table>
  )
}

export type Transaction = {
  name: string
  transactions?: Transaction[]
}
