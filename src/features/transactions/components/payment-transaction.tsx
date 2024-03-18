import { Card, CardContent } from '@/features/common/components/card'
import { PaymentTransactionModel } from '../models/models'
import { cn } from '@/features/common/utils'
import { DisplayAlgo } from '@/features/common/components/display-algo'

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
      <CardContent className={cn('text-sm space-y-2')}>
        <h1 className={cn('text-2xl text-primary font-bold')}>Transfer</h1>

        {transactionCardItems.map((item, index) => (
          <dl className={cn('grid grid-cols-8')} key={index}>
            <dt>{item.dt}</dt>
            <dd className={cn('col-span-7')}>{item.dd}</dd>
          </dl>
        ))}
      </CardContent>
    </Card>
  )
}
