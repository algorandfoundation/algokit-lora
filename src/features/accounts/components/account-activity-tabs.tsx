import { Tabs, TabsList, TabsTrigger } from '@/features/common/components/tabs'
import { cn } from '@/features/common/utils'

const accountVisualTransactionTabId = 'visual'
const accountVisualAssetsTabId = 'table'
const accountVisualCreatedAssetsTabId = 'created-assets'
const accountVisualCreatedApplicationsTabId = 'created-applications'
const accountVisualOptedApplicationsTabId = 'opted-applications'
export const accountDetailsLabel = 'View account Details'
export const accountVisualGraphTabLabel = 'Transactions'
export const accountVisualAssetsTabLabel = 'Assets'
export const accountVisualCreatedAssetsTabLabel = 'Created Assets'
export const accountVisualCreatedApplicationsTabLabel = 'Created Applications'
export const accountVisualOptedApplicationsTabLabel = 'Opted Applications'

export function AccountActivityTabs() {
  return (
    <Tabs defaultValue={accountVisualTransactionTabId}>
      <TabsList aria-label={accountDetailsLabel}>
        <TabsTrigger
          className={cn('data-[state=active]:border-primary data-[state=active]:border-b-2 w-44')}
          value={accountVisualTransactionTabId}
        >
          {accountVisualGraphTabLabel}
        </TabsTrigger>
        <TabsTrigger
          className={cn('data-[state=active]:border-primary data-[state=active]:border-b-2 w-44')}
          value={accountVisualAssetsTabId}
        >
          {accountVisualAssetsTabLabel}
        </TabsTrigger>
        <TabsTrigger
          className={cn('data-[state=active]:border-primary data-[state=active]:border-b-2 w-44')}
          value={accountVisualCreatedAssetsTabId}
        >
          {accountVisualCreatedAssetsTabLabel}
        </TabsTrigger>
        <TabsTrigger
          className={cn('data-[state=active]:border-primary data-[state=active]:border-b-2 w-44')}
          value={accountVisualCreatedApplicationsTabId}
        >
          {accountVisualCreatedApplicationsTabLabel}
        </TabsTrigger>
        <TabsTrigger
          className={cn('data-[state=active]:border-primary data-[state=active]:border-b-2 w-44')}
          value={accountVisualOptedApplicationsTabId}
        >
          {accountVisualOptedApplicationsTabLabel}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
