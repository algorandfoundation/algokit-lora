import { cn } from '@/features/common/utils'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs'
import { TransactionViewTable } from './transaction-view-table'
import { TransactionViewVisual } from './transaction-view-visual'
import { TransactionModel } from '../models'

type Props = {
  transaction: TransactionModel
}

const visualTransactionDetailsTabId = 'visual'
const tableTransactionDetailsTabId = 'table'
export const transactionDetailsLabel = 'View Transaction Details'
export const visualTransactionDetailsTabLabel = 'Visual'
export const tableTransactionDetailsTabLabel = 'Table'

export function TransactionViewTabs({ transaction }: Props) {
  return (
    <Tabs defaultValue={visualTransactionDetailsTabId}>
      <TabsList aria-label={transactionDetailsLabel}>
        <TabsTrigger
          className={cn('data-[state=active]:border-primary data-[state=active]:border-b-2 w-32')}
          value={visualTransactionDetailsTabId}
        >
          {visualTransactionDetailsTabLabel}
        </TabsTrigger>
        <TabsTrigger
          className={cn('data-[state=active]:border-primary data-[state=active]:border-b-2 w-32')}
          value={tableTransactionDetailsTabId}
        >
          {tableTransactionDetailsTabLabel}
        </TabsTrigger>
      </TabsList>
      <TabsContent value={visualTransactionDetailsTabId} className={cn('border-solid border-2 p-4')}>
        <TransactionViewVisual transaction={transaction} />
      </TabsContent>
      <TabsContent value={tableTransactionDetailsTabId} className={cn('border-solid border-2 p-4')}>
        <TransactionViewTable transaction={transaction} />
      </TabsContent>
    </Tabs>
  )
}
