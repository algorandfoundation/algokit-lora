import { InnerTransaction, Transaction, TransactionType } from '@/features/transactions/models'
import { cn } from '@/features/common/utils'
import { ellipseAddress } from '@/utils/ellipse-address'
import { ColumnDef } from '@tanstack/react-table'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { TransactionLink } from '@/features/transactions/components/transaction-link'
import { asTo } from '@/features/common/mappers/to'
import { InnerTransactionLink } from '@/features/transactions/components/inner-transaction-link'

const indentationWidth = 20

export const applicationTransactionsTableColumns: ColumnDef<Transaction | InnerTransaction>[] = [
  {
    header: 'Transaction Id',
    accessorFn: (transaction) => transaction,
    cell: ({ row, getValue }) => {
      const transaction = getValue<Transaction | InnerTransaction>()
      return (
        <div
          style={{
            marginLeft: `${indentationWidth * row.depth}px`,
          }}
        >
          {'innerId' in transaction ? (
            <InnerTransactionLink transactionId={transaction.networkTransactionId} innerTransactionId={transaction.innerId} />
          ) : (
            <TransactionLink transactionId={transaction.id} short={true} />
          )}
        </div>
      )
    },
  },
  {
    header: 'Round',
    accessorKey: 'confirmedRound',
  },
  {
    accessorKey: 'sender',
    header: 'From',
    cell: (c) => ellipseAddress(c.getValue<string>()),
  },
  {
    header: 'To',
    accessorFn: asTo,
  },
  {
    header: 'Fee',
    accessorFn: (transaction) => transaction,
    cell: (c) => {
      const transaction = c.getValue<Transaction>()
      if (transaction.type === TransactionType.ApplicationCall)
        return <DisplayAlgo className={cn('justify-center')} amount={transaction.fee} />
    },
  },
]
