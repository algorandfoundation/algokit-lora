import { TransactionsTable } from './transactions-table'
import { InnerTransaction, Transaction } from '../models'
import { OverflowAutoTabsContent, Tabs, TabsList, TabsTrigger } from '@/features/common/components/tabs'
import { TransactionsGraph } from '@/features/transactions-graph'
import { transactionsTableColumnsWithoutRound } from './transactions-table-columns'
import { asTransactionsGraphData } from '@/features/transactions-graph/mappers'
import { useMemo } from 'react'

type Props = {
  transaction: Transaction | InnerTransaction
}

const transactionVisualGraphTabId = 'visual'
const transactionVisualTableTabId = 'table'
export const transactionDetailsLabel = 'View Transaction Details'
export const transactionVisualGraphTabLabel = 'Visual'
export const transactionVisualTableTabLabel = 'Table'

export function TransactionViewTabs({ transaction }: Props) {
  const transactionsGraph = useMemo(() => asTransactionsGraphData([transaction]), [transaction])
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
        <TransactionsGraph transactionsGraphData={transactionsGraph} downloadable={true} />
      </OverflowAutoTabsContent>
      <OverflowAutoTabsContent value={transactionVisualTableTabId}>
        <TransactionsTable transactions={[transaction]} columns={transactionsTableColumnsWithoutRound} subRowsExpanded={true} />
      </OverflowAutoTabsContent>
    </Tabs>
  )
}
