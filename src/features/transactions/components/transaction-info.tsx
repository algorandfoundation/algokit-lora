import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { dateFormatter } from '@/utils/format'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { useMemo } from 'react'
import { PaymentTransactionModel } from '../models'
import { DescriptionList } from '@/features/common/components/description-list'
import { isDefined } from '@/utils/is-defined'

type Props = {
  transaction: PaymentTransactionModel
}

export const transactionIdLabel = 'Transaction ID'
export const transactionTypeLabel = 'Type'
export const transactionTimestampLabel = 'Timestamp'
export const transactionBlockLabel = 'Block'
export const transactionGroupLabel = 'Group'
export const transactionFeeLabel = 'Fee'

export function TransactionInfo({ transaction }: Props) {
  const transactionInfoItems = useMemo(
    () =>
      [
        {
          dt: transactionIdLabel,
          dd: transaction.id,
        },
        {
          dt: transactionTypeLabel,
          dd: transaction.type,
        },
        {
          dt: transactionTimestampLabel,
          dd: dateFormatter.asLongDateTime(new Date(transaction.roundTime)),
        },
        {
          dt: transactionBlockLabel,
          dd: (
            <a href="#" className={cn('text-primary underline')}>
              {transaction.confirmedRound}
            </a>
          ),
        },
        transaction.group
          ? {
              dt: transactionGroupLabel,
              dd: (
                <a href="#" className={cn('text-primary underline')}>
                  {transaction.group}
                </a>
              ),
            }
          : undefined,
        {
          dt: transactionFeeLabel,
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
