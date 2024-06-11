import { cn } from '@/features/common/utils'
import { TransactionsTable } from './transactions-table'
import { InnerTransaction, Transaction } from '../models'
import { OverflowAutoTabsContent, Tabs, TabsList, TabsTrigger } from '@/features/common/components/tabs'
import { TransactionsGraph } from './transactions-graph/transactions-graph'
import { transactionsTableColumnsWithoutRound } from './transactions-table-columns'

type Props = {
  transaction: Transaction | InnerTransaction
}

const transactionVisualGraphTabId = 'visual'
const transactionVisualTableTabId = 'table'
export const transactionDetailsLabel = 'View Transaction Details'
export const transactionVisualGraphTabLabel = 'Graph'
export const transactionVisualTableTabLabel = 'Table'

export function TransactionViewTabs({ transaction }: Props) {
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
          {transactionVisualTableTabLabel}
        </TabsTrigger>
      </TabsList>
      <OverflowAutoTabsContent value={transactionVisualGraphTabId}>
        <TransactionsGraph transactions={[transaction]} />
      </OverflowAutoTabsContent>
      <OverflowAutoTabsContent value={transactionVisualTableTabId}>
        <TransactionsTable transactions={[transaction]} columns={transactionsTableColumnsWithoutRound} subRowsExpanded={true} />
      </OverflowAutoTabsContent>
    </Tabs>
  )
}
