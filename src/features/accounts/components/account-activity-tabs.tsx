import { OverflowAutoTabsContent, Tabs, TabsList, TabsTrigger } from '@/features/common/components/tabs'
import { cn } from '@/features/common/utils'
import { useMemo } from 'react'

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
  const tabs = useMemo(
    () => [
      {
        id: accountVisualTransactionTabId,
        label: accountDetailsLabel,
        children: '',
      },
      {
        id: accountVisualAssetsTabId,
        label: accountVisualAssetsTabLabel,
        children: '',
      },
      {
        id: accountVisualCreatedAssetsTabId,
        label: accountVisualCreatedAssetsTabLabel,
        children: '',
      },
      {
        id: accountVisualCreatedApplicationsTabId,
        label: accountVisualCreatedApplicationsTabLabel,
        children: '',
      },
      {
        id: accountVisualOptedApplicationsTabId,
        label: accountVisualOptedApplicationsTabLabel,
        children: '',
      },
    ],
    []
  )
  return (
    <Tabs defaultValue={accountVisualTransactionTabId}>
      <TabsList aria-label={accountDetailsLabel}>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} className={cn('data-[state=active]:border-primary data-[state=active]:border-b-2 w-44')} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <OverflowAutoTabsContent key={tab.id} value={tab.id} className={cn('border-solid border-2 border-border')}>
          <div className="grid">
            <div className="overflow-auto p-4">{tab.children}</div>
          </div>
        </OverflowAutoTabsContent>
      ))}
    </Tabs>
  )
}
