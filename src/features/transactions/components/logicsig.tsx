import { LogicsigModel } from '../models'
import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs'
import { useLogicsigTeal } from '../data'
import { RenderLoadable } from '@/features/common/components/render-loadable'

export type LogicsigProps = {
  logicsig: LogicsigModel
}

const tabs = {
  base64: 'Base64',
  teal: 'Teal',
}

export function Logicsig({ logicsig }: LogicsigProps) {
  const [tealLoadable, fetchTeal] = useLogicsigTeal(logicsig.logic)

  return (
    <>
      <h1 className={cn('text-2xl text-primary font-bold')}>Logicsig</h1>
      <Tabs
        defaultValue={tabs.base64}
        onValueChange={(activeTab) => {
          if (activeTab === tabs.teal) {
            fetchTeal()
          }
        }}
      >
        <TabsList aria-label="View Transaction">
          <TabsTrigger className={cn('data-[state=active]:border-primary data-[state=active]:border-b-2 w-32')} value={tabs.base64}>
            {tabs.base64}
          </TabsTrigger>
          <TabsTrigger className={cn('data-[state=active]:border-primary data-[state=active]:border-b-2 w-32')} value={tabs.teal}>
            {tabs.teal}
          </TabsTrigger>
        </TabsList>
        <TabsContent value={tabs.base64} className={cn('border-solid border-2 border-border p-4')}>
          <Card className={cn('p-4')}>
            <CardContent className={cn('text-sm space-y-4')}>
              <div className={cn('space-y-2')}>
                <p>{logicsig.logic}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value={tabs.teal} className={cn('border-solid border-2 border-border p-4')}>
          <Card className={cn('p-4')}>
            <CardContent className={cn('text-sm space-y-4')}>
              <div className={cn('space-y-2')}>
                <RenderLoadable loadable={tealLoadable}>{(teal) => <pre className={cn('whitespace-pre-wrap')}>{teal}</pre>}</RenderLoadable>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
