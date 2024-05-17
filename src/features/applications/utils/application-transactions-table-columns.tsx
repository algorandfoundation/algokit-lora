import { InnerTransaction, Transaction, TransactionType } from '@/features/transactions/models'
import { cn } from '@/features/common/utils'
import { ellipseAddress } from '@/utils/ellipse-address'
import { ColumnDef } from '@tanstack/react-table'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { TransactionLink } from '@/features/transactions/components/transaction-link'
import { ellipseId } from '@/utils/ellipse-id'
import { asTo } from '@/features/common/mappers/to'

export const applicationTransactionsTableColumns: ColumnDef<Transaction | InnerTransaction>[] = [
  {
    header: 'Transaction Id',
    accessorFn: (transaction) => transaction,
    cell: (c) => {
      const transaction = c.getValue<Transaction | InnerTransaction>()
      return 'innerId' in transaction ? (
        <TransactionLink
          className={cn('text-primary underline cursor-pointer grid gap-2')}
          transactionId={transaction.networkTransactionId}
        >
          <span>{ellipseId(transaction.id)}</span>
          <span>(Inner)</span>
        </TransactionLink>
      ) : (
        <TransactionLink transactionId={transaction.id} short={true} />
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
