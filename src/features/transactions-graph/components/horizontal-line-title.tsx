import { TransactionType } from '@/features/transactions/models'
import { useMemo } from 'react'
import { InnerTransactionLink } from '@/features/transactions/components/inner-transaction-link'
import { TransactionLink } from '@/features/transactions/components/transaction-link'
import { cn } from '@/features/common/utils'
import { graphConfig } from '@/features/transactions-graph/components/graph-config'
import { TransactionGraphHorizontalLine } from '@/features/transactions-graph'

type Props = {
  horizontalLine: TransactionGraphHorizontalLine
}
export function HorizontalLineTitle({ horizontalLine }: Props) {
  const { transaction, hasNextSibling, ancestors, depth } = horizontalLine
  const parent = ancestors.length > 0 ? ancestors[ancestors.length - 1] : undefined
  const hasChildren =
    horizontalLine.transaction.type === TransactionType.ApplicationCall && horizontalLine.transaction.innerTransactions.length > 0
  const hasParent = !!parent
  // Top and second level transactions aren't indented to safe space
  const marginMultiplier = depth > 0 ? depth - 1 : 0

  const component = useMemo(() => {
    if ('innerId' in transaction) {
      return <InnerTransactionLink transactionId={transaction.networkTransactionId} innerTransactionId={transaction.innerId} />
    }
    return <TransactionLink transactionId={transaction.id} short={true} />
  }, [transaction])

  return (
    <div
      className={cn(`relative h-full p-0 flex items-center`, 'px-0')}
      style={{ marginLeft: marginMultiplier * graphConfig.indentationWidth }}
    >
      {hasParent && <ConnectionToParent />}
      <div
        className={cn('inline')}
        style={{
          marginLeft: hasParent ? `${graphConfig.indentationWidth + 8}px` : `16px`,
        }}
      >
        {component}
      </div>
      {hasParent && hasNextSibling && <ConnectionToSibling />}
      {hasChildren && <ConnectionToChildren indentLevel={depth} />}
    </div>
  )
}

function ConnectionToParent() {
  // The connection between this transaction and the parent
  return (
    <div
      className={cn(`border-primary rounded-bl-lg`, `h-1/2`, `absolute top-0 left-0`)}
      style={{
        borderLeftWidth: `${graphConfig.lineWidth}px`,
        borderBottomWidth: `${graphConfig.lineWidth}px`,
        width: `${graphConfig.indentationWidth + 8}px`,
      }}
    ></div>
  )
}

function ConnectionToSibling() {
  // The connection between this transaction and the next sibling
  return (
    <div
      className={cn('border-primary', 'absolute left-0')}
      style={{
        width: `${graphConfig.indentationWidth + 8}px`,
        borderLeftWidth: `${graphConfig.lineWidth}px`,
        height: `calc(50% + ${graphConfig.lineWidth}px)`,
        top: `calc(50% - ${graphConfig.lineWidth}px)`,
      }}
    ></div>
  )
}

function ConnectionToChildren({ indentLevel }: { indentLevel: number }) {
  // The connection between this transaction and the children
  return (
    <div
      className={cn('w-2', 'border-primary rounded-tl-lg', 'absolute left-0')}
      style={{
        marginLeft: indentLevel > 0 ? `${graphConfig.indentationWidth}px` : undefined,
        borderLeftWidth: `${graphConfig.lineWidth}px`,
        borderTopWidth: `${graphConfig.lineWidth}px`,
        height: `calc(50% + ${graphConfig.lineWidth}px)`,
        top: `calc(50% - ${graphConfig.lineWidth}px)`,
      }}
    ></div>
  )
}
