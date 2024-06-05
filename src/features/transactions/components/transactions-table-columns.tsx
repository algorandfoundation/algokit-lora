import { InnerTransaction, Transaction, TransactionType } from '@/features/transactions/models'
import { cn } from '@/features/common/utils'
import { ellipseAddress } from '@/utils/ellipse-address'
import { ColumnDef } from '@tanstack/react-table'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { TransactionLink } from '@/features/transactions/components/transaction-link'
import { asTo } from '@/features/common/mappers/to'
import { InnerTransactionLink } from '@/features/transactions/components/inner-transaction-link'
import { DisplayAssetAmount } from '@/features/common/components/display-asset-amount'
import { GroupLink } from '@/features/groups/components/group-link'
import SvgChevronRight from '@/features/common/components/icons/chevron-right'
import SvgChevronDown from '@/features/common/components/icons/chevron-down'

const indentationWidth = 20

export const transactionFromLabel = 'From'
export const transactionToLabel = 'To'
export const transactionAmountLabel = 'Amount'
export const transactionRoundLabel = 'Round'

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
          <InnerTransactionLink transactionId={transaction.networkTransactionId} innerTransactionId={transaction.innerId} />
        ) : (
          <TransactionLink transactionId={transaction.id} short={true} />
        )}
      </div>
    )
  },
}
const collapsibleIdColumn: ColumnDef<Transaction | InnerTransaction> = {
  header: 'Transaction ID',
  accessorFn: (transaction) => transaction,
  cell: ({ row, getValue }) => {
    const transaction = getValue<Transaction | InnerTransaction>()
    return (
      <>
        <div
          style={{
            marginLeft: `${indentationWidth * row.depth}px`,
          }}
          className={cn('inline')}
        >
          <div className={cn('inline-block min-w-6')}>
            {row.getCanExpand() ? (
              <button onClick={row.getToggleExpandedHandler()}>{row.getIsExpanded() ? <SvgChevronDown /> : <SvgChevronRight />}</button>
            ) : null}
          </div>
          {'innerId' in transaction ? (
            <InnerTransactionLink transactionId={transaction.networkTransactionId} innerTransactionId={transaction.innerId} />
          ) : (
            <TransactionLink transactionId={transaction.id} short={true} />
          )}
        </div>
      </>
    )
  },
}
const groupIdColumn: ColumnDef<Transaction | InnerTransaction> = {
  header: 'Group ID',
  accessorFn: (transaction) => transaction,
  cell: (c) => {
    const transaction = c.getValue<Transaction>()
    return transaction.group ? <GroupLink round={transaction.confirmedRound} groupId={transaction.group} short={true} /> : undefined
  },
}
const roundColumn: ColumnDef<Transaction | InnerTransaction> = {
  header: transactionRoundLabel,
  accessorFn: (transaction) => transaction.confirmedRound,
}
const fromColumn: ColumnDef<Transaction | InnerTransaction> = {
  header: transactionFromLabel,
  accessorFn: (transaction) => transaction.sender,
  cell: (c) => ellipseAddress(c.getValue<string>()),
}
const toColumn: ColumnDef<Transaction | InnerTransaction> = {
  header: transactionToLabel,
  accessorFn: asTo,
}
const typeColumn: ColumnDef<Transaction | InnerTransaction> = {
  header: 'Type',
  accessorFn: (transaction) => transaction.type,
}
const amountColumn: ColumnDef<Transaction | InnerTransaction> = {
  header: transactionAmountLabel,
  accessorFn: (transaction) => transaction,
  cell: (c) => {
    const transaction = c.getValue<Transaction>()
    if (transaction.type === TransactionType.Payment) {
      return <DisplayAlgo className={cn('justify-center')} amount={transaction.amount} />
    } else if (transaction.type === TransactionType.AssetTransfer) {
      return <DisplayAssetAmount amount={transaction.amount} asset={transaction.asset} />
    }
  },
}

export const transactionsTableColumns: ColumnDef<Transaction | InnerTransaction>[] = [
  idColumn,
  groupIdColumn,
  roundColumn,
  fromColumn,
  toColumn,
  typeColumn,
  amountColumn,
]
export const transactionsTableColumnsWithoutRound: ColumnDef<Transaction | InnerTransaction>[] = [
  idColumn,
  groupIdColumn,
  fromColumn,
  toColumn,
  typeColumn,
  amountColumn,
]
export const transactionsTableColumnsWithCollapsibleSubRows: ColumnDef<Transaction | InnerTransaction>[] = [
  collapsibleIdColumn,
  groupIdColumn,
  roundColumn,
  fromColumn,
  toColumn,
  typeColumn,
  amountColumn,
]
