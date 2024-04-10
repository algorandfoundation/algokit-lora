import { LogicsigModel } from '../models'
import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs'
import { useLogicsigTeal } from '../data'
import { RenderLoadable } from '@/features/common/components/render-loadable'

type LogicsigProps = {
  logicsig: LogicsigModel
}

const base64LogicsigTabId = 'base64'
const tealLogicsigTabId = 'teal'
export const logicsigLabel = 'View Logic Signature Details'
export const base64LogicsigTabLabel = 'Base64'
export const tealLogicsigTabLabel = 'Teal'

export function Logicsig({ logicsig }: LogicsigProps) {
  const [tealLoadable, fetchTeal] = useLogicsigTeal(logicsig.logic)

  return (
    <>
      <h1 className={cn('text-2xl text-primary font-bold')}>Logic Signature</h1>
      <Tabs
        defaultValue={base64LogicsigTabId}
        onValueChange={(activeTab) => {
          if (activeTab === tealLogicsigTabId) {
            fetchTeal()
          }
        }}
      >
        <TabsList aria-label={logicsigLabel}>
          <TabsTrigger className={cn('data-[state=active]:border-primary data-[state=active]:border-b-2 w-32')} value={base64LogicsigTabId}>
            {base64LogicsigTabLabel}
          </TabsTrigger>
          <TabsTrigger className={cn('data-[state=active]:border-primary data-[state=active]:border-b-2 w-32')} value={tealLogicsigTabId}>
            {tealLogicsigTabLabel}
          </TabsTrigger>
        </TabsList>
        <TabsContent value={base64LogicsigTabId} className={cn('border-solid border-2 border-border p-4')}>
          <Card className={cn('p-4')}>
            <CardContent className={cn('text-sm space-y-4')}>
              <div className={cn('space-y-2')}>
                <pre>{logicsig.logic}</pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value={tealLogicsigTabId} className={cn('border-solid border-2 border-border p-4')}>
          <Card>
            <CardContent className={cn('text-sm space-y-4')}>
              <div className={cn('h-96 grid')}>
                <RenderLoadable loadable={tealLoadable}>{(teal) => <pre className={cn('overflow-scroll p-4')}>{teal}</pre>}</RenderLoadable>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
