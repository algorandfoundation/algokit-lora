import { AssetTransferTransactionSubType, InnerTransaction, Transaction, TransactionType } from '@/features/transactions/models'
import { cn } from '@/features/common/utils'
import { ColumnDef } from '@tanstack/react-table'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { TransactionLink } from '@/features/transactions/components/transaction-link'
import { InnerTransactionLink } from '@/features/transactions/components/inner-transaction-link'
import { DisplayAssetAmount } from '@/features/common/components/display-asset-amount'
import { GroupLink } from '@/features/groups/components/group-link'
import { AccountLink } from '@/features/accounts/components/account-link'
import { TransactionTo } from './transaction-to'
import { BlockLink } from '@/features/blocks/components/block-link'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { DateFormatted } from '@/features/common/components/date-formatted'
import { TransactionTypeBadge } from './transaction-type-badge'

const indentationWidth = 12

export const transactionFromLabel = 'From'
export const transactionToLabel = 'To'
export const transactionAmountLabel = 'Amount'
export const transactionRoundLabel = 'Round'
export const transactionTimestampLabel = 'Timestamp'
export const transactionFeeLabel = 'Fee'

const isAccountCloseTransaction = (txn: Transaction | InnerTransaction) => txn.type === TransactionType.Payment && txn.closeRemainder

const expandColumn: ColumnDef<Transaction | InnerTransaction> = {
  id: 'expand',
  header: () => undefined,
  cell: ({ row }) => {
    return (
      <div className={cn('flex items-center size-0')}>
        {row.getCanExpand() ? (
          <div>{row.getIsExpanded() ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}</div>
        ) : undefined}
      </div>
    )
  },
}
const idColumn: ColumnDef<Transaction | InnerTransaction> = {
  header: 'Transaction ID',
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
          <InnerTransactionLink networkTransactionId={transaction.networkTransactionId} innerTransactionId={transaction.innerId} />
        ) : (
          <TransactionLink transactionId={transaction.id} short={true} />
        )}
      </div>
    )
  },
  meta: { className: 'align-top' },
}
const groupColumn: ColumnDef<Transaction | InnerTransaction> = {
  header: 'Group ID',
  accessorFn: (transaction) => transaction,
  cell: (c) => {
    const transaction = c.getValue<Transaction>()
    return transaction.group ? <GroupLink round={transaction.confirmedRound} groupId={transaction.group} short={true} /> : undefined
  },
  meta: { className: 'align-top' },
}
const blockColumn: ColumnDef<Transaction | InnerTransaction> = {
  header: transactionRoundLabel,
  accessorFn: (transaction) => transaction,
  cell: (c) => {
    const transaction = c.getValue<Transaction>()
    return <BlockLink round={transaction.confirmedRound} />
  },
  meta: { className: 'align-top' },
}
const timestampColumn: ColumnDef<Transaction | InnerTransaction> = {
  header: transactionTimestampLabel,
  accessorFn: (transaction) => transaction.roundTime,
  cell: (c) => <DateFormatted date={new Date(c.getValue<number>())} short={true} />,
  meta: { className: 'align-top' },
}
const fromColumn: ColumnDef<Transaction | InnerTransaction> = {
  header: transactionFromLabel,
  accessorFn: (transaction) => transaction,
  cell: (c) => {
    const transaction = c.getValue<Transaction>()
    const from =
      transaction.type === TransactionType.AssetTransfer &&
      transaction.subType === AssetTransferTransactionSubType.Clawback &&
      transaction.clawbackFrom
        ? transaction.clawbackFrom
        : transaction.sender
    return <AccountLink address={from} short={true} />
  },
  meta: { className: 'max-w-36 align-top' },
}
const toColumn: ColumnDef<Transaction | InnerTransaction> = {
  header: transactionToLabel,
  accessorFn: (transaction) => transaction,
  cell: (c) => {
    const transaction = c.getValue<Transaction>()
    if (transaction.type === TransactionType.Payment && transaction.closeRemainder) {
      return (
        <div className="grid gap-2">
          <AccountLink address={transaction.receiver} short={true} />
          <AccountLink address={transaction.closeRemainder.to} short={true} />
        </div>
      )
    }
    return (
      <div className={cn(isAccountCloseTransaction(transaction) ? 'grid' : '')}>
        <TransactionTo transaction={c.getValue<Transaction>()} />
      </div>
    )
  },
  meta: { className: 'max-w-36 align-top' },
}
const typeColumn: ColumnDef<Transaction | InnerTransaction> = {
  header: 'Type',
  accessorFn: (transaction) => transaction.type,
  cell: (c) => <TransactionTypeBadge transactionType={c.getValue<TransactionType>()} />,
  meta: { className: 'align-top' },
}
const amountColumn: ColumnDef<Transaction | InnerTransaction> = {
  header: transactionAmountLabel,
  accessorFn: (transaction) => transaction,
  cell: (c) => {
    const transaction = c.getValue<Transaction>()
    if (transaction.type === TransactionType.Payment) {
      if (transaction.closeRemainder) {
        return (
          <div className="grid gap-2">
            <DisplayAlgo amount={transaction.amount} />
            <DisplayAlgo amount={transaction.closeRemainder.amount} />
          </div>
        )
      }
      return (
        <div className={cn(isAccountCloseTransaction(transaction) ? 'grid' : '')}>
          <DisplayAlgo amount={transaction.amount} />
        </div>
      )
    } else if (transaction.type === TransactionType.AssetTransfer) {
      return (
        <div className={cn(isAccountCloseTransaction(transaction) ? 'grid' : '')}>
          <DisplayAssetAmount amount={transaction.amount} asset={transaction.asset} />
        </div>
      )
    }
  },
  meta: { className: 'align-top' },
}
const feeColumn: ColumnDef<Transaction | InnerTransaction> = {
  header: transactionFeeLabel,
  accessorFn: (transaction) => transaction,
  cell: (c) => {
    const transaction = c.getValue<Transaction>()
    return <DisplayAlgo amount={transaction.fee} />
  },
  meta: { className: 'align-top' },
}

export const transactionsTableColumns: ColumnDef<Transaction | InnerTransaction>[] = [
  expandColumn,
  idColumn,
  groupColumn,
  blockColumn,
  timestampColumn,
  fromColumn,
  toColumn,
  typeColumn,
  amountColumn,
  feeColumn,
]
export const transactionsTableColumnsWithoutRound: ColumnDef<Transaction | InnerTransaction>[] = [
  expandColumn,
  idColumn,
  groupColumn,
  fromColumn,
  toColumn,
  typeColumn,
  amountColumn,
  feeColumn,
]
