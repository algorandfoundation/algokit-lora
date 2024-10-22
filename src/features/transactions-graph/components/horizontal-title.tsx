import { TransactionType } from '@/features/transactions/models'
import { useMemo } from 'react'
import { asInnerTransactionLinkText, InnerTransactionLink } from '@/features/transactions/components/inner-transaction-link'
import { asTransactionLinkTextComponent, TransactionLink } from '@/features/transactions/components/transaction-link'
import { cn } from '@/features/common/utils'
import { graphConfig } from '@/features/transactions-graph/components/graph-config'
import { Horizontal } from '../models'

type Props = {
  horizontal: Horizontal
  isSimulated: boolean
}
export function HorizontalTitle({ horizontal, isSimulated }: Props) {
  const { transaction, hasNextSibling, ancestors, depth } = horizontal
  const parent = ancestors.length > 0 ? ancestors[ancestors.length - 1] : undefined
  const hasChildren = horizontal.transaction.type === TransactionType.AppCall && horizontal.transaction.innerTransactions.length > 0
  const hasParent = !!parent
  // Top and second level transactions aren't indented to save space
  const marginMultiplier = depth > 0 ? depth - 1 : 0

  const component = useMemo(() => {
    if ('innerId' in transaction) {
      return isSimulated ? (
        <span className="text-primary">{asInnerTransactionLinkText(transaction.networkTransactionId, transaction.innerId)}</span>
      ) : (
        <InnerTransactionLink networkTransactionId={transaction.networkTransactionId} innerTransactionId={transaction.innerId} />
      )
    }
    return isSimulated ? asTransactionLinkTextComponent(transaction.id) : <TransactionLink transactionId={transaction.id} short={true} />
  }, [isSimulated, transaction])

  return (
    <div
      className={cn(`relative h-full p-0 flex items-center`, 'px-0')}
      style={{ marginLeft: marginMultiplier * graphConfig.indentationWidth }}
    >
      {hasParent && <ConnectionToParent />}
      <div
        className={cn('inline')}
        style={{
          marginLeft: hasParent ? `${graphConfig.indentationWidth + 10}px` : hasChildren ? `10px` : '0px',
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
      className={cn(`border-primary rounded-bl`, `h-1/2`, `absolute top-0 left-0`)}
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
        height: `calc(50% + ${graphConfig.lineWidth * 2}px)`,
        top: `calc(50% - ${graphConfig.lineWidth * 2}px)`,
      }}
    ></div>
  )
}

function ConnectionToChildren({ indentLevel }: { indentLevel: number }) {
  // The connection between this transaction and the children
  return (
    <div
      className={cn('w-2', 'border-primary rounded-tl', 'absolute left-0')}
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
