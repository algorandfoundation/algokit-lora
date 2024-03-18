import { Card, CardContent } from '@/features/common/components/card'
import { PaymentTransactionModel } from '../models/models'
import { cn } from '@/features/common/utils'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/features/common/components/tabs'
import { Button } from '@/features/common/components/button'

export type Props = {
  transaction: PaymentTransactionModel
}

export function PaymentTransaction({ transaction }: Props) {
  const transactionCardItems = [
    {
      dt: 'Sender',
      dd: (
        <a href="#" className={cn('text-primary underline')}>
          {transaction.sender}
        </a>
      ),
    },
    {
      dt: 'Receiver',
      dd: (
        <a href="#" className={cn('text-primary underline')}>
          {transaction.receiver}
        </a>
      ),
    },
    {
      dt: 'Amount',
      dd: <DisplayAlgo microAlgo={transaction.amount} />,
    },
  ]

  return (
    <Card className={cn('p-4')}>
      <CardContent className={cn('text-sm space-y-4')}>
        <div className={cn('space-y-2')}>
          <div className={cn('flex items-center justify-between')}>
            <h1 className={cn('text-2xl text-primary font-bold')}>Transfer</h1>
            <Button>Replay</Button>
          </div>
          {transactionCardItems.map((item, index) => (
            <dl className={cn('grid grid-cols-8')} key={index}>
              <dt>{item.dt}</dt>
              <dd className={cn('col-span-7')}>{item.dd}</dd>
            </dl>
          ))}
        </div>
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
              {transaction.textNote}
            </TabsContent>
            <TabsContent value="base64" className={cn('border-solid border-2 border-border h-60 p-4')}>
              {transaction.base64Note}
            </TabsContent>
            <TabsContent value="messagePack" className={cn('border-solid border-2 border-border h-60 p-4')}>
              {transaction.messagePackNote}
            </TabsContent>
          </Tabs>
        </div>
        <div className={cn('space-y-2')}>
          <h2 className={cn('text-xl font-bold')}>Transction JSON</h2>
          <div className={cn('border-solid border-2 border-border h-96 p-4 overflow-y-scroll')}>
            <pre>{JSON.stringify(JSON.parse(transaction.json), null, 4)}</pre>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
