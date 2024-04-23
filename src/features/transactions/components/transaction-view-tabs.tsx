import { cn } from '@/features/common/utils'
import { TransactionViewTable } from './transaction-view-table'
import { TransactionViewVisual } from './transaction-view-visual'
import { InnerTransactionModel, TransactionModel } from '../models'
import { OverflowAutoTabsContent, Tabs, TabsList, TabsTrigger } from '@/features/common/components/tabs'

type Props = {
  transaction: TransactionModel | InnerTransactionModel
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
      <OverflowAutoTabsContent value={visualTransactionDetailsTabId}>
        <TransactionViewVisual transaction={transaction} />
      </OverflowAutoTabsContent>
      <OverflowAutoTabsContent value={tableTransactionDetailsTabId}>
        <TransactionViewTable transaction={transaction} />
      </OverflowAutoTabsContent>
    </Tabs>
  )
}
