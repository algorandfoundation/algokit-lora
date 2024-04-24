import { cn } from '@/features/common/utils'
import { InnerTransaction, Transaction, TransactionType } from '../models'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { ellipseAddress } from '@/utils/ellipse-address'
import { FlattenedTransaction, flattenInnerTransactions } from '@/utils/flatten-inner-transactions'
import { useMemo } from 'react'
import { ellipseId } from '@/utils/ellipse-id'
import { DisplayAssetAmount } from '@/features/common/components/display-asset-amount'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/features/common/components/data-table'
import { InnerTransactionLink } from './inner-transaction-link'

const graphConfig = {
  indentationWidth: 20,
}

type Props = {
  transaction: Transaction | InnerTransaction
}

export const transactionSenderLabel = 'Sender'
export const transactionReceiverLabel = 'Receiver'
export const transactionAmountLabel = 'Amount'

export const tableColumns: ColumnDef<FlattenedTransaction>[] = [
  {
    header: 'Transaction Id',
    accessorFn: (item) => item,
    cell: (c) => {
      const { nestingLevel, transaction } = c.getValue<FlattenedTransaction>()
      return (
        <div
          style={{
            marginLeft: `${graphConfig.indentationWidth * nestingLevel}px`,
          }}
        >
          {'innerId' in transaction ? (
            <InnerTransactionLink innerTransactionId={transaction.innerId}>Inner {transaction.innerId}</InnerTransactionLink>
          ) : (
            ellipseId(transaction.id)
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'transaction.sender',
    header: 'From',
    cell: (c) => ellipseAddress(c.getValue<string>()),
  },
  {
    header: 'To',
    accessorFn: (item) => item.transaction,
    cell: (c) => {
      const transaction = c.getValue<Transaction>()
      if (transaction.type === TransactionType.Payment || transaction.type === TransactionType.AssetTransfer)
        return ellipseAddress(transaction.receiver)
      if (transaction.type === TransactionType.ApplicationCall) return transaction.applicationId
    },
  },
  {
    accessorKey: 'transaction.type',
    header: 'Type',
  },
  {
    header: 'Amount',
    accessorFn: (item) => item.transaction,
    cell: (c) => {
      const transaction = c.getValue<Transaction>()
      if (transaction.type === TransactionType.Payment) return <DisplayAlgo className={cn('justify-center')} amount={transaction.amount} />
      if (transaction.type === TransactionType.AssetTransfer)
        return <DisplayAssetAmount amount={transaction.amount} asset={transaction.asset} />
    },
  },
]

export function TransactionViewTable({ transaction }: Props) {
  const flattenedTransactions = useMemo(() => flattenInnerTransactions(transaction), [transaction])

  return <DataTable columns={tableColumns} data={flattenedTransactions} />
}
