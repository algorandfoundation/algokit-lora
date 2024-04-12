import { cn } from '@/features/common/utils'
import { TransactionModel, TransactionType } from '../models'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { ellipseAddress } from '@/utils/ellipse-address'
import { flattenInnerTransactions } from '@/utils/flatten-inner-transactions'
import { useMemo } from 'react'
import { ellipseId } from '@/utils/ellipse-id'

const graphConfig = {
  indentationWidth: 20,
}

type Props = {
  transaction: TransactionModel
}

export const transactionSenderLabel = 'Sender'
export const transactionReceiverLabel = 'Receiver'
export const transactionAmountLabel = 'Amount'

export function TransactionViewTable({ transaction }: Props) {
  const flattenedTransactions = useMemo(() => flattenInnerTransactions(transaction), [transaction])

  return (
    <table className={cn('w-full')}>
      <thead>
        <tr>
          <th className={cn('border-2')}>Transaction ID</th>
          <th className={cn('p-2 border-2')}>{transactionSenderLabel}</th>
          <th className={cn('p-2 border-2')}>{transactionReceiverLabel}</th>
          <th className={cn('p-2 border-2')}>Type</th>
          <th className={cn('p-2 border-2')}>{transactionAmountLabel}</th>
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
                {ellipseId(transaction.id)}
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
