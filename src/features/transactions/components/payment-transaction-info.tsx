import { cn } from '@/features/common/utils'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { useMemo } from 'react'
import { PaymentTransactionModel } from '../models'
import { DescriptionList } from '@/features/common/components/description-list'

type Props = {
  transaction: PaymentTransactionModel
}

export const transactionIdLabel = 'Transaction ID'
export const transactionTypeLabel = 'Type'
export const transactionTimestampLabel = 'Timestamp'
export const transactionBlockLabel = 'Block'
export const transactionGroupLabel = 'Group'
export const transactionFeeLabel = 'Fee'

export function PaymentTransactionInfo({ transaction }: Props) {
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
    <div className={cn('space-y-2')}>
      <div className={cn('flex items-center justify-between')}>
        <h1 className={cn('text-2xl text-primary font-bold')}>Payment</h1>
      </div>
      <DescriptionList items={paymentTransactionItems} />
    </div>
  )
}
