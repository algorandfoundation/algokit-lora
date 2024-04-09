import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { dateFormatter } from '@/utils/format'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { useMemo } from 'react'
import { PaymentTransactionModel } from '../models'
import { DescriptionList } from '@/features/common/components/description-list'
import { isDefined } from '@/utils/is-defined'
import { transactionPageConstants } from '@/features/theme/constant'

export type Props = {
  transaction: PaymentTransactionModel
}

export function TransactionInfo({ transaction }: Props) {
  const transactionInfoItems = useMemo(
    () =>
      [
        {
          dt: transactionPageConstants.labels.transactionId,
          dd: transaction.id,
        },
        {
          dt: transactionPageConstants.labels.type,
          dd: transaction.type,
        },
        {
          dt: transactionPageConstants.labels.timestamp,
          dd: dateFormatter.asLongDateTime(new Date(transaction.roundTime)),
        },
        {
          dt: transactionPageConstants.labels.block,
          dd: (
            <a href="#" className={cn('text-primary underline')}>
              {transaction.confirmedRound}
            </a>
          ),
        },
        transaction.group
          ? {
              dt: transactionPageConstants.labels.group,
              dd: (
                <a href="#" className={cn('text-primary underline')}>
                  {transaction.group}
                </a>
              ),
            }
          : undefined,
        {
          dt: transactionPageConstants.labels.fee,
          dd: transaction.fee ? <DisplayAlgo amount={transaction.fee} /> : 'N/A',
        },
      ].filter(isDefined),
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
