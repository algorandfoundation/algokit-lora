import { cn } from '@/features/common/utils'
import { OverflowAutoTabsContent, Tabs, TabsList, TabsTrigger } from '@/features/common/components/tabs'
import { Group } from '../models'
import { TransactionsGraph } from '@/features/transactions-graph/components/transactions-graph'
import { TransactionsTable } from '@/features/transactions/components/transactions-table'
import { transactionsTableColumnsWithoutRound } from '@/features/transactions/components/transactions-table-columns'
import { useMemo } from 'react'
import { asTransactionsGraph } from '@/features/transactions-graph/mappers'

type Props = {
  group: Group
}

const graphTabId = 'graph'
const tableTabId = 'table'
export const groupVisual = 'View Group'
export const groupVisualGraphLabel = 'Graph'
export const groupVisualTableLabel = 'Table'

export function GroupTransactionsViewTabs({ group }: Props) {
  const transactionsGraph = useMemo(() => asTransactionsGraph(group.transactions), [group.transactions])

  return (
    <Tabs defaultValue={graphTabId}>
      <TabsList aria-label={groupVisual}>
        <TabsTrigger className={cn('data-[state=active]:border-primary data-[state=active]:border-b-2 w-32')} value={graphTabId}>
          {groupVisualGraphLabel}
        </TabsTrigger>
        <TabsTrigger className={cn('data-[state=active]:border-primary data-[state=active]:border-b-2 w-32')} value={tableTabId}>
          {groupVisualTableLabel}
        </TabsTrigger>
      </TabsList>
      <OverflowAutoTabsContent value={graphTabId}>
        <TransactionsGraph transactionsGraphData={transactionsGraph} />
      </OverflowAutoTabsContent>
      <OverflowAutoTabsContent value={tableTabId}>
        <TransactionsTable transactions={group.transactions} columns={transactionsTableColumnsWithoutRound} subRowsExpanded={false} />
      </OverflowAutoTabsContent>
    </Tabs>
  )
}
