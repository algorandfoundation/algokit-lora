import { OverflowAutoTabsContent, Tabs, TabsList, TabsTrigger } from '@/features/common/components/tabs'
import { Group } from '../models'
import { TransactionsGraph } from '@/features/transactions-graph'
import { TransactionsTable } from '@/features/transactions/components/transactions-table'
import { transactionsTableColumnsWithoutRound } from '@/features/transactions/components/transactions-table-columns'
import { useMemo } from 'react'
import { asTransactionsGraphData } from '@/features/transactions-graph/mappers'

type Props = {
  group: Group
}

const graphTabId = 'visual'
const tableTabId = 'table'
export const groupVisual = 'View Group'
export const groupVisualGraphLabel = 'Visual'
export const groupVisualTableLabel = 'Table'

export function GroupTransactionsViewTabs({ group }: Props) {
  const transactionsGraph = useMemo(() => asTransactionsGraphData(group.transactions), [group.transactions])

  return (
    <Tabs defaultValue={graphTabId}>
      <TabsList aria-label={groupVisual}>
        <TabsTrigger className="w-32" value={graphTabId}>
          {groupVisualGraphLabel}
        </TabsTrigger>
        <TabsTrigger className="w-32" value={tableTabId}>
          {groupVisualTableLabel}
        </TabsTrigger>
      </TabsList>
      <OverflowAutoTabsContent value={graphTabId}>
        <TransactionsGraph transactionsGraphData={transactionsGraph} downloadable={true} />
      </OverflowAutoTabsContent>
      <OverflowAutoTabsContent value={tableTabId}>
        <TransactionsTable transactions={group.transactions} columns={transactionsTableColumnsWithoutRound} subRowsExpanded={false} />
      </OverflowAutoTabsContent>
    </Tabs>
  )
}
