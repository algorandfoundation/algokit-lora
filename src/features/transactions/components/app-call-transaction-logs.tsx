import { cn } from '@/features/common/utils'
import { Tabs, TabsList, TabsTrigger, OverflowAutoTabsContent } from '@/features/common/components/tabs'
import { useMemo } from 'react'
import { base64ToUtf8 } from '@/utils/base64-to-utf8'
import { DescriptionList } from '@/features/common/components/description-list'

type Props = {
  logs: string[]
}

export const logsLabel = 'View Logs'
const base64LogTabId = 'base64'
export const base64LogsTabLabel = 'Base64'
const textLogTabId = 'text'
export const textLogsTabLabel = 'UTF-8'

export function AppCallTransactionLogs({ logs }: Props) {
  const texts = useMemo(() => {
    return logs.map((log) => base64ToUtf8(log))
  }, [logs])

  return (
    <div className={cn('space-y-2')}>
      <h3>Logs</h3>
      <Tabs defaultValue={base64LogTabId}>
        <TabsList aria-label={logsLabel}>
          <TabsTrigger className="w-32" value={base64LogTabId}>
            {base64LogsTabLabel}
          </TabsTrigger>
          <TabsTrigger className="w-32" value={textLogTabId}>
            {textLogsTabLabel}
          </TabsTrigger>
        </TabsList>
        <OverflowAutoTabsContent value={base64LogTabId} overflowContainerClassName="max-h-96">
          <DescriptionList
            items={logs.map((log, index) => ({
              dt: `${index + 1}.`,
              dd: <span className="text-wrap break-all">{log}</span>,
            }))}
          />
        </OverflowAutoTabsContent>
        <OverflowAutoTabsContent value={textLogTabId} overflowContainerClassName="max-h-96">
          <DescriptionList
            items={texts.map((text, index) => ({
              dt: `${index + 1}.`,
              dd: <span className="text-wrap break-all">{text}</span>,
            }))}
          />
        </OverflowAutoTabsContent>
      </Tabs>
    </div>
  )
}
