import { cn } from '@/features/common/utils'
import { TransactionsTable } from './transactions-table'
import { InnerTransaction, Transaction } from '../models'
import { OverflowAutoTabsContent, Tabs, TabsList, TabsTrigger } from '@/features/common/components/tabs'
import { TransactionsGraph } from './transactions-graph'

type Props = {
  transaction: Transaction | InnerTransaction
}

const transactionVisualGraphTabId = 'visual'
const transactionVisualTableTabId = 'table'
export const transactionDetailsLabel = 'View Transaction Details'
export const transactionVisualGraphTabLabel = 'Graph'
export const transactionVisualTableTableLabel = 'Table'

export function TransactionVisualTabs({ transaction }: Props) {
  return (
    <Tabs defaultValue={transactionVisualGraphTabId}>
      <TabsList aria-label={transactionDetailsLabel}>
        <TabsTrigger
          className={cn('data-[state=active]:border-primary data-[state=active]:border-b-2 w-32')}
          value={transactionVisualGraphTabId}
        >
          {transactionVisualGraphTabLabel}
        </TabsTrigger>
        <TabsTrigger
          className={cn('data-[state=active]:border-primary data-[state=active]:border-b-2 w-32')}
          value={transactionVisualTableTabId}
        >
          {transactionVisualTableTableLabel}
        </TabsTrigger>
      </TabsList>
      <OverflowAutoTabsContent value={transactionVisualGraphTabId}>
        <TransactionsGraph transactions={[transaction]} />
      </OverflowAutoTabsContent>
      <OverflowAutoTabsContent value={transactionVisualTableTabId}>
        <TransactionsTable transactions={[transaction]} />
      </OverflowAutoTabsContent>
    </Tabs>
  )
}
