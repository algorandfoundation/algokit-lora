import { cn } from '@/features/common/utils'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs'

export type Props = {
  transaction: TransactionResult
}

export function TransactionNote({ transaction }: Props) {
  const textNote = transaction.note
  const base64Note = transaction.note
  const messagePackNote = transaction.note

  return (
    <div className={cn('space-y-2')}>
      <h2 className={cn('text-xl font-bold')}>Note</h2>
      <Tabs defaultValue="text">
        <TabsList>
          <TabsTrigger className={cn('data-[state=active]:border-primary data-[state=active]:border-b-2 w-32')} value="text">
            Text
          </TabsTrigger>
          <TabsTrigger className={cn('data-[state=active]:border-primary data-[state=active]:border-b-2 w-32')} value="base64">
            Base64
          </TabsTrigger>
          <TabsTrigger className={cn('data-[state=active]:border-primary data-[state=active]:border-b-2 w-32')} value="messagePack">
            Message pack
          </TabsTrigger>
        </TabsList>
        <TabsContent value="text" className={cn('border-solid border-2 border-border h-60 p-4')}>
          {textNote}
        </TabsContent>
        <TabsContent value="base64" className={cn('border-solid border-2 border-border h-60 p-4')}>
          {base64Note}
        </TabsContent>
        <TabsContent value="messagePack" className={cn('border-solid border-2 border-border h-60 p-4')}>
          {messagePackNote}
        </TabsContent>
      </Tabs>
    </div>
  )
}
