import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { dateFormatter } from '@/utils/format'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { useMemo } from 'react'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'

export type Props = {
  transaction: TransactionResult
}

export function TransactionInfo({ transaction }: Props) {
  const transactionCardItems = useMemo(
    () => [
      {
        dt: 'Transaction ID',
        dd: transaction.id,
      },
      {
        dt: 'Type',
        dd: transaction['tx-type'],
      },
      {
        dt: 'Timestamp',
        // TODO: check timezone
        dd: dateFormatter.asLongDateTime(new Date(transaction['round-time']! * 1000)),
      },
      {
        dt: 'Block',
        dd: (
          <a href="#" className={cn('text-primary underline')}>
            {transaction['confirmed-round']}
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
    ],
    [transaction]
  )

  return (
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
  )
}
