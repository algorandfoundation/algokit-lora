import { Card, CardContent } from '@/features/common/components/card'
import { PaymentTransactionModel } from '../models/models'
import { cn } from '@/features/common/utils'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { Button } from '@/features/common/components/button'
import { TransactionInfo } from './transaction-info'
import { TransactionNote } from './transaction-note'
import { TransactionJson } from './transaction-json'
import { useMemo } from 'react'
import { DescriptionList } from '@/features/common/components/description-list'
import { TransactionVisualisation } from './transaction-visualisation'

export type Props = {
  transaction: PaymentTransactionModel
}

export function PaymentTransaction({ transaction }: Props) {
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
        dd: <DisplayAlgo microAlgo={transaction.amount} />,
      },
    ],
    [transaction.amount, transaction.receiver, transaction.sender]
  )

  return (
    <div className={cn('space-y-6 pt-7')}>
      <TransactionInfo transaction={transaction} />
      <Card className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-4')}>
          <div className={cn('space-y-2')}>
            <div className={cn('flex items-center justify-between')}>
              <h1 className={cn('text-2xl text-primary font-bold')}>Transfer</h1>
              <Button>Replay</Button>
            </div>
            <DescriptionList items={paymentTransactionItems} />
          </div>
          <TransactionNote transaction={transaction} />
          <TransactionVisualisation transaction={transaction} />
          <TransactionJson transaction={transaction} />
        </CardContent>
      </Card>
    </div>
  )
}
