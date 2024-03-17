import { Card, CardContent } from '@/features/common/components/card'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { cn } from '@/features/common/utils'
import { dateFormatter } from '@/utils/format'

type Props = {
  transaction: TransactionModel
}

export function Transaction({ transaction }: Props) {
  const transactionCardItems = [
    {
      dt: 'Transaction ID',
      dd: transaction.id,
    },
    {
      dt: 'Type',
      dd: transaction.type,
    },
    {
      dt: 'Timestamp',
      // TODO: check timezone
      dd: dateFormatter.asLongDateTime(transaction.roundTime),
    },
    {
      dt: 'Block',
      dd: (
        <a href="#" className={cn('text-primary underline')}>
          {transaction.confirmedRound}
        </a>
      ),
    },
    {
      dt: 'Group',
      dd: (
        <a href="#" className={cn('text-primary underline')}>
          {transaction.group}
        </a>
      ),
    },
    {
      dt: 'Fee',
      dd: <DisplayAlgo microAlgo={transaction.fee} />,
    },
  ]
  return (
    <div>
      <h1 className={cn('text-2xl text-primary font-bold')}>Transaction</h1>
      <div className={cn('space-y-6 pt-7')}>
        <Card className={cn('p-4')}>
          <CardContent className={cn('text-sm space-y-2')}>
            {transactionCardItems.map((item, index) => (
              <dl className={cn('grid grid-cols-8')} key={index}>
                <dt>{item.dt}</dt>
                <dd className={cn('col-span-7')}>{item.dd}</dd>
              </dl>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export enum TransactionType {
  Payment = 'Payment',
}

export type TransactionModel = {
  id: string
  type: TransactionType
  confirmedRound: number
  roundTime: Date
  group: string
  // The fee in micro Algo
  fee: number
}
