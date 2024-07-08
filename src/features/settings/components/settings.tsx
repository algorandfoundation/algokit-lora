import { OverflowAutoTabsContent, Tabs, TabsList, TabsTrigger } from '@/features/common/components/tabs'
import { NetworkForm } from '@/features/settings/components/network-form'

export const networkTabId = 'network'
export const networkTabLabel = 'Network'

export function Settings() {
  return (
    <Tabs defaultValue={networkTabId}>
      <TabsList aria-label={networkTabLabel}>
        <TabsTrigger key={networkTabId} className="w-44" value={networkTabId}>
          {networkTabLabel}
        </TabsTrigger>
      </TabsList>
      <OverflowAutoTabsContent key={networkTabId} value={networkTabId} className="h-auto">
        <NetworkForm />
      </OverflowAutoTabsContent>
    </Tabs>
  )
}
