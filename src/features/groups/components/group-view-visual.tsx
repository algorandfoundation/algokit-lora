import { useMemo } from 'react'
import { Group } from '../models'
import { flattenInnerTransactions } from '@/utils/flatten-inner-transactions'
import { ellipseAddress } from '@/utils/ellipse-address'
import { cn } from '@/features/common/utils'
import { TransactionRow } from '@/features/transactions/components/transaction-view-visual'
import { Transaction, InnerTransaction, TransactionType } from '@/features/transactions/models'

type Props = {
  group: Group
}

const graphConfig = {
  rowHeight: 40,
  colWidth: 128,
  indentationWidth: 20,
  lineWidth: 2,
  circleDimension: 20,
  paymentTransactionColor: 'rgb(126 200 191)',
}

function CollaboratorId({ collaborator }: { collaborator: Collaborator }) {
  return (
    <h1 className={cn('text-l font-semibold')}>
      {collaborator.type === 'Account' && ellipseAddress(collaborator.id)}
      {collaborator.type !== 'Account' && collaborator.id}
    </h1>
  )
}

export function GroupViewVisual({ group }: Props) {
  const flattenedTransactions = useMemo(
    () => group.transactions.flatMap((transaction) => flattenInnerTransactions(transaction)),
    [group.transactions]
  )
  const transactionCount = flattenedTransactions.length
  const collaborators: Collaborator[] = [
    ...getTransactionsCollaborators(flattenedTransactions.map((t) => t.transaction)),
    {
      type: 'Account',
      id: '',
    }, // an empty account to make room to show transactions with the same sender and receiver
  ]
  const maxNestingLevel = Math.max(...flattenedTransactions.map((t) => t.nestingLevel))
  const gridCollaboratorColumns = collaborators.length
  const firstColumnWidth = graphConfig.colWidth + maxNestingLevel * graphConfig.indentationWidth

  // TODO: in group, link to the transaction page
  return (
    <div
      className={cn('relative grid')}
      style={{
        gridTemplateColumns: `minmax(${firstColumnWidth}px, ${firstColumnWidth}px) repeat(${gridCollaboratorColumns}, ${graphConfig.colWidth}px)`,
        gridTemplateRows: `repeat(${transactionCount + 1}, ${graphConfig.rowHeight}px)`,
      }}
    >
      <div>{/* The first header cell is empty */}</div>
      {collaborators.map((collaborator, index) => (
        <div className={cn('p-2 flex justify-center')} key={index}>
          <CollaboratorId collaborator={collaborator} />
        </div>
      ))}
      {/* The below div is for drawing the background dash lines */}
      <div className={cn('absolute left-0')} style={{ top: `${graphConfig.rowHeight}px` }}>
        <div>
          <div className={cn('p-0')}></div>
          <div
            className={cn('p-0')}
            style={{
              height: `${transactionCount * graphConfig.rowHeight}px`,
              width: `${graphConfig.colWidth * gridCollaboratorColumns}px`,
            }}
          >
            <div
              className={cn('grid h-full')}
              style={{
                gridTemplateColumns: `minmax(${firstColumnWidth}px, ${firstColumnWidth}px) repeat(${gridCollaboratorColumns}, ${graphConfig.colWidth}px)`,
                height: `${transactionCount * graphConfig.rowHeight}px`,
              }}
            >
              <div></div>
              {collaborators
                .filter((a) => a.id) // Don't need to draw for the empty collaborator
                .map((_, index) => (
                  <div key={index} className={cn('flex justify-center')}>
                    <div className={cn('border-muted h-full border-dashed')} style={{ borderLeftWidth: graphConfig.lineWidth }}></div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
      {group.transactions.map((transaction, index) => (
        <TransactionRow key={index} transaction={transaction} hasParent={false} collaborators={collaborators} verticalBars={[]} />
      ))}
    </div>
  )
}

// TODO: refactor this
const getTransactionsCollaborators = (transactions: Transaction[]): Collaborator[] => {
  return transactions.reduce((acc, transaction) => {
    const collaborators = getTransactionCollaborators(transaction)
    collaborators.forEach((collaborator) => {
      if (!acc.some((c) => c.type === collaborator.type && c.id === collaborator.id)) {
        acc.push(collaborator)
      }
    })
    return acc
  }, new Array<Collaborator>())
}

// TODO: refactor this
const getTransactionCollaborators = (transaction: Transaction | InnerTransaction): Collaborator[] => {
  const collaborators: Collaborator[] = [
    {
      type: 'Account',
      id: transaction.sender,
    },
  ]
  if (transaction.type === TransactionType.Payment || transaction.type === TransactionType.AssetTransfer) {
    collaborators.push({
      type: 'Account',
      id: transaction.receiver,
    })
  }
  if (transaction.type === TransactionType.ApplicationCall) {
    collaborators.push({
      type: 'Application',
      id: transaction.applicationId.toString(),
    })
  }
  if (transaction.type === TransactionType.AssetConfig) {
    collaborators.push({
      type: 'Asset',
      id: transaction.assetId.toString(),
    })
  }
  if (transaction.type === TransactionType.AssetFreeze) {
    collaborators.push({
      type: 'Asset',
      id: transaction.assetId.toString(),
    })
  }
  return collaborators
}

type Collaborator = {
  type: 'Account' | 'Application' | 'Asset'
  id: string
}
