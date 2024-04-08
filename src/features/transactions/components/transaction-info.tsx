import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { TransactionModel } from '../models/models'
import { dateFormatter } from '@/utils/format'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { useMemo } from 'react'
import { DescriptionList } from '@/features/common/components/description-list'

export type Props = {
  transaction: TransactionModel
}

export function TransactionInfo({ transaction }: Props) {
  const transactionInfoItems = useMemo(
    () => [
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
        dd: transaction.fee ? <DisplayAlgo microAlgo={transaction.fee} /> : 'N/A',
      },
    ],
    [transaction.confirmedRound, transaction.fee, transaction.group, transaction.id, transaction.roundTime, transaction.type]
  )

  return (
    <Card className={cn('p-4')}>
      <CardContent className={cn('text-sm space-y-2')}>
        <DescriptionList items={transactionInfoItems} />
      </CardContent>
    </Card>
  )
}
