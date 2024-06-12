import { cn } from '@/features/common/utils'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs'
import { useMemo } from 'react'
import { base64ToUtf8 } from '@/utils/base64-to-utf8'

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
        <TabsContent value={base64LogTabId} className="p-4">
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </TabsContent>
        <TabsContent value={textLogTabId} className="p-4">
          {texts.map((text, index) => (
            <div key={index}>{text}</div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
