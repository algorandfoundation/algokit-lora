import { TransactionsTable } from './transactions-table'
import { InnerTransaction, Transaction } from '../models'
import { OverflowAutoTabsContent, Tabs, TabsList, TabsTrigger } from '@/features/common/components/tabs'
import { TransactionsGraph } from '@/features/transactions-graph'
import { transactionsTableColumnsWithoutRound } from './transactions-table-columns'
import { useTransactionsGraphData } from '@/features/transactions-graph/mappers'

type Props = {
  transaction: Transaction | InnerTransaction
}

const transactionVisualGraphTabId = 'visual'
const transactionVisualTableTabId = 'table'
export const transactionDetailsLabel = 'View Transaction Details'
export const transactionVisualGraphTabLabel = 'Visual'
export const transactionVisualTableTabLabel = 'Table'

export function TransactionViewTabs({ transaction }: Props) {
  const transactionsGraphData = useTransactionsGraphData([transaction])
  return (
    <Tabs defaultValue={transactionVisualGraphTabId}>
      <TabsList aria-label={transactionDetailsLabel}>
        <TabsTrigger className="w-32" value={transactionVisualGraphTabId}>
          {transactionVisualGraphTabLabel}
        </TabsTrigger>
        <TabsTrigger className="w-32" value={transactionVisualTableTabId}>
          {transactionVisualTableTabLabel}
        </TabsTrigger>
      </TabsList>
      <OverflowAutoTabsContent value={transactionVisualGraphTabId}>
        <TransactionsGraph transactionsGraphData={transactionsGraphData} />
      </OverflowAutoTabsContent>
      <OverflowAutoTabsContent value={transactionVisualTableTabId}>
        <TransactionsTable transactions={[transaction]} columns={transactionsTableColumnsWithoutRound} subRowsExpanded={true} />
      </OverflowAutoTabsContent>
    </Tabs>
  )
}
