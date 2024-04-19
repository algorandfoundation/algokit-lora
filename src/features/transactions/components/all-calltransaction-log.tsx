import { cn } from '@/features/common/utils'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs'

type Props = {
  logs: string[]
}

const logLabel = 'View Logs'
const base64LogTabId = 'base64'
const base64LogTabLabel = 'Base64'
const textLogTabId = 'text'
const textLogTabLabel = 'Text'

export function AppCallTransactionLogs({ logs }: Props) {
  return (
    <div className={cn('space-y-2')}>
      <h2 className={cn('text-xl font-bold')}>Logs</h2>
      <Tabs defaultValue={base64LogTabId}>
        <TabsList aria-label={logLabel}>
          <TabsTrigger className={cn('data-[state=active]:border-primary data-[state=active]:border-b-2 w-32')} value={base64LogTabId}>
            {base64LogTabLabel}
          </TabsTrigger>
          <TabsTrigger className={cn('data-[state=active]:border-primary data-[state=active]:border-b-2 w-32')} value={textLogTabId}>
            {textLogTabLabel}
          </TabsTrigger>
        </TabsList>
        <TabsContent value={base64LogTabId} className={cn('border-solid border-2 border-border h-60 p-4')}>
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </TabsContent>
        <TabsContent value={textLogTabId} className={cn('border-solid border-2 border-border h-60 p-4')}>
          {logs.map((log, index) => (
            <div key={index}>{atob(log)}</div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
