import { InnerTransaction, Transaction, TransactionType } from '@/features/transactions/models'
import { cn } from '@/features/common/utils'
import { ColumnDef } from '@tanstack/react-table'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { TransactionLink } from '@/features/transactions/components/transaction-link'
import { InnerTransactionLink } from '@/features/transactions/components/inner-transaction-link'
import { DisplayAssetAmount } from '@/features/common/components/display-asset-amount'
import { GroupLink } from '@/features/groups/components/group-link'
import SvgChevronDown from '@/features/common/components/icons/chevron-down'
import SvgChevronRight from '@/features/common/components/icons/chevron-right'
import { AccountLink } from '@/features/accounts/components/account-link'
import { TransactionTo } from './transaction-to'
import { BlockLink } from '@/features/blocks/components/block-link'

const indentationWidth = 20

export const transactionFromLabel = 'From'
export const transactionToLabel = 'To'
export const transactionAmountLabel = 'Amount'
export const transactionRoundLabel = 'Round'

export const transactionsTableColumns: ColumnDef<Transaction | InnerTransaction>[] = [
  {
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
      )
    },
  },
  {
    header: 'Group ID',
    accessorFn: (transaction) => transaction,
    cell: (c) => {
      const transaction = c.getValue<Transaction>()
      return transaction.group ? <GroupLink round={transaction.confirmedRound} groupId={transaction.group} short={true} /> : undefined
    },
  },
  {
    header: transactionRoundLabel,
    accessorFn: (transaction) => transaction,
    cell: (c) => {
      const transaction = c.getValue<Transaction>()
      return <BlockLink round={transaction.confirmedRound} />
    },
  },
  {
    header: transactionFromLabel,
    accessorFn: (transaction) => transaction.sender,
    cell: (c) => <AccountLink address={c.getValue<string>()} short={true} />,
  },
  {
    header: transactionToLabel,
    accessorFn: (transaction) => transaction,
    cell: (c) => <TransactionTo transaction={c.getValue<Transaction>()} />,
  },
  {
    header: 'Type',
    accessorFn: (transaction) => transaction.type,
  },
  {
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
  },
]
export const transactionsTableColumnsWithoutRound = transactionsTableColumns.filter((x) => x.header !== transactionRoundLabel)
