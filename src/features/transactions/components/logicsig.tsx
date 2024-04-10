import { LogicsigModel } from '../models'
import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs'

export type LogicsigProps = {
  logicsig: LogicsigModel
}

export function Logicsig({ logicsig }: LogicsigProps) {
  return (
    <>
      <h1 className={cn('text-2xl text-primary font-bold')}>Logicsig</h1>
      <Tabs defaultValue="Logicsig">
        <TabsList aria-label="View Transaction">
          <TabsTrigger className={cn('data-[state=active]:border-primary data-[state=active]:border-b-2 w-32')} value="Base64">
            Base64
          </TabsTrigger>
          <TabsTrigger className={cn('data-[state=active]:border-primary data-[state=active]:border-b-2 w-32')} value="Teal">
            Teal
          </TabsTrigger>
        </TabsList>
        <TabsContent value="Base64" className={cn('border-solid border-2 border-border p-4')}>
          <Card className={cn('p-4')}>
            <CardContent className={cn('text-sm space-y-4')}>
              <div className={cn('space-y-2')}>
                <p>{logicsig.logic}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="Teal" className={cn('border-solid border-2 border-border p-4')}>
          <h1>Teal</h1>
        </TabsContent>
      </Tabs>
    </>
  )
}
