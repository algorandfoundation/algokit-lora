import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { Button } from '@/features/common/components/button'
import { TransactionInfo } from './transaction-info'
import { TransactionNote } from './transaction-note'
import { TransactionJson } from './transaction-json'
import { useMemo } from 'react'
import { PaymentTransactionModel } from '../models'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { DescriptionList } from '@/features/common/components/description-list'
import { TransactionViewVisual } from './transaction-view-visual'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/features/common/components/tabs'
import { TransactionViewTable } from './transaction-view-table'

export type Props = {
  transaction: PaymentTransactionModel
  rawTransaction: TransactionResult
}

export function PaymentTransaction({ transaction, rawTransaction }: Props) {
  const paymentTransactionItems = useMemo(
    () => [
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
        dd: <DisplayAlgo amount={transaction.amount} />,
      },
    ],
    [transaction.sender, transaction.receiver, transaction.amount]
  )

  return (
    <div className={cn('space-y-6 pt-7')}>
      <TransactionInfo transaction={transaction} />
      <Card className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-4')}>
          <div className={cn('space-y-2')}>
            <div className={cn('flex items-center justify-between')}>
              <h1 className={cn('text-2xl text-primary font-bold')}>Payment</h1>
              <Button>Replay</Button>
            </div>
            <DescriptionList items={paymentTransactionItems} />
          </div>
          <TransactionNote transaction={transaction} />
          <div className={cn('space-y-2')}>
            <h2 className={cn('text-xl font-bold')}>View</h2>
            <Tabs defaultValue="visual">
              <TabsList>
                <TabsTrigger className={cn('data-[state=active]:border-primary data-[state=active]:border-b-2 w-32')} value="visual">
                  Visual
                </TabsTrigger>
                <TabsTrigger className={cn('data-[state=active]:border-primary data-[state=active]:border-b-2 w-32')} value="table">
                  Table
                </TabsTrigger>
              </TabsList>
              <TabsContent value="visual" className={cn('border-solid border-2 border-border h-60 p-4')}>
                <TransactionViewVisual transaction={transaction} />
              </TabsContent>
              <TabsContent value="table" className={cn('border-solid border-2 border-border h-60 p-4')}>
                <TransactionViewTable transaction={transaction} />
              </TabsContent>
            </Tabs>
          </div>
          <TransactionJson transaction={rawTransaction} />
        </CardContent>
      </Card>
    </div>
  )
}
