import { cn } from '@/features/common/utils'
import { TransactionModel, TransactionType } from '../models'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { ellipseAddress } from '@/utils/ellipse-address'

const graphConfig = {
  indentationWidth: 20,
}

type FlattenedTransaction = {
  nestingLevel: number
  transaction: TransactionModel
}

function flatternInnerTransactions(transaction: TransactionModel, nestingLevel = 0): FlattenedTransaction[] {
  return [
    {
      nestingLevel,
      transaction,
    },
  ].concat(transaction.transactions?.flatMap((transaction) => flatternInnerTransactions(transaction, nestingLevel + 1)) ?? [])
}

type Props = {
  transaction: TransactionModel
}

export function TransactionViewTable({ transaction }: Props) {
  const flattenedTransactions = flatternInnerTransactions(transaction)

  return (
    <table className={cn('w-full')}>
      <thead>
        <tr>
          <th className={cn('border-2')}>Transaction ID</th>
          <th className={cn('p-2 border-2')}>From</th>
          <th className={cn('p-2 border-2')}>To</th>
          <th className={cn('p-2 border-2')}>Type</th>
          <th className={cn('p-2 border-2')}>Amount</th>
        </tr>
      </thead>
      <tbody>
        {flattenedTransactions.map(({ transaction, nestingLevel }) => (
          <tr key={transaction.id}>
            <td className={cn('p-2 border-2')}>
              <div
                style={{
                  marginLeft: `${graphConfig.indentationWidth * nestingLevel}px`,
                }}
              >
                {ellipseAddress(transaction.id)}
              </div>
            </td>
            <td className={cn('p-2 border-2 text-center')}>{ellipseAddress(transaction.sender)}</td>
            <td className={cn('p-2 border-2 text-center')}>{ellipseAddress(transaction.receiver)}</td>
            <td className={cn('p-2 border-2 text-center')}>{transaction.type}</td>
            <td className={cn('p-2 border-2')}>
              {transaction.type === TransactionType.Payment ? (
                <DisplayAlgo className={cn('justify-center')} amount={transaction.amount} />
              ) : (
                'N/A'
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
