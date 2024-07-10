import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/features/common/components/tabs'
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
      <TabsContent key={networkTabId} value={networkTabId} className="h-auto p-4">
        <NetworkForm />
      </TabsContent>
    </Tabs>
  )
}
