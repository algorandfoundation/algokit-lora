import { cn } from '@/features/common/utils'
import { OverflowAutoTabsContent, Tabs, TabsList, TabsTrigger } from '@/features/common/components/tabs'
import { GroupViewVisual } from './group-view-visual'
import { GroupViewTable } from './group-view-table'
import { Group } from '../models'

type Props = {
  group: Group
}

const visualTabId = 'visual'
const tableTabId = 'table'
export const groupTransactionsLabel = 'View Group Transactions'
// TODO: consider renaming Visual to Chart or Graph
export const groupTransactionVisualTabLabel = 'Visual'
export const groupTransactionTableTabLabel = 'Table'

export function GroupViewTabs({ group }: Props) {
  return (
    <Tabs defaultValue={visualTabId}>
      <TabsList aria-label={groupTransactionsLabel}>
        <TabsTrigger className={cn('data-[state=active]:border-primary data-[state=active]:border-b-2 w-32')} value={visualTabId}>
          {groupTransactionVisualTabLabel}
        </TabsTrigger>
        <TabsTrigger className={cn('data-[state=active]:border-primary data-[state=active]:border-b-2 w-32')} value={tableTabId}>
          {groupTransactionTableTabLabel}
        </TabsTrigger>
      </TabsList>
      <OverflowAutoTabsContent value={visualTabId}>
        <GroupViewVisual group={group} />
      </OverflowAutoTabsContent>
      <OverflowAutoTabsContent value={tableTabId}>
        <GroupViewTable group={group} />
      </OverflowAutoTabsContent>
    </Tabs>
  )
}
