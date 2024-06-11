import { InnerTransaction, Transaction } from '@/features/transactions/models'
import { useMemo } from 'react'
import { InnerTransactionLink } from '@/features/transactions/components/inner-transaction-link'
import { TransactionLink } from '@/features/transactions/components/transaction-link'
import { cn } from '@/features/common/utils'
import { graphConfig } from '@/features/transactions-graph/components/graph-config'

export function TransactionId({ hasParent, transaction }: { hasParent: boolean; transaction: Transaction | InnerTransaction }) {
  const component = useMemo(() => {
    if ('innerId' in transaction) {
      return <InnerTransactionLink transactionId={transaction.networkTransactionId} innerTransactionId={transaction.innerId} />
    }
    return <TransactionLink transactionId={transaction.id} short={true} />
  }, [transaction])

  return (
    <div
      className={cn('inline')}
      style={{
        marginLeft: hasParent ? `${graphConfig.indentationWidth + 8}px` : `16px`,
      }}
    >
      {component}
    </div>
  )
}
