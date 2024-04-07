import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { Button } from '@/features/common/components/button'
import { TransactionInfo } from './transaction-info'
import { TransactionNote } from './transaction-note'
import { TransactionJson } from './transaction-json'
import { useMemo } from 'react'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'

export type Props = {
  transaction: TransactionResult
}

export function PaymentTransaction({ transaction }: Props) {
  const transactionCardItems = useMemo(
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
            {transaction['payment-transaction']!.receiver}
          </a>
        ),
      },
      {
        dt: 'Amount',
        dd: <DisplayAlgo microAlgo={transaction['payment-transaction']!.amount} />,
      },
    ],
    [transaction]
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
            {transactionCardItems.map((item, index) => (
              <dl className={cn('grid grid-cols-8')} key={index}>
                <dt>{item.dt}</dt>
                <dd className={cn('col-span-7')}>{item.dd}</dd>
              </dl>
            ))}
          </div>
          <TransactionNote transaction={transaction} />
          <TransactionJson transaction={transaction} />
        </CardContent>
      </Card>
    </div>
  )
}
