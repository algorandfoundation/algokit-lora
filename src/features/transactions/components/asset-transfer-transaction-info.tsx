import { cn } from '@/features/common/utils'
import { useMemo } from 'react'
import { AssetTransferTransactionModel } from '../models'
import { DescriptionList } from '@/features/common/components/description-list'

type Props = {
  transaction: AssetTransferTransactionModel
}

export const transactionIdLabel = 'Transaction ID'
export const transactionTypeLabel = 'Type'
export const transactionTimestampLabel = 'Timestamp'
export const transactionBlockLabel = 'Block'
export const transactionGroupLabel = 'Group'
export const transactionFeeLabel = 'Fee'

export function AssetTransferTransactionInfo({ transaction }: Props) {
  const items = useMemo(
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
        dt: 'Asset',
        dd: (
          <a href="#" className={cn('text-primary underline')}>
            {transaction.asset.id} {`${transaction.asset.name ? `(${transaction.asset.name})` : ''}`}
          </a>
        ),
      },
      {
        dt: 'Amount',
        dd: `${transaction.amount} ${transaction.asset.unitName ?? ''}`,
      },
    ],
    [transaction.sender, transaction.receiver, transaction.asset.id, transaction.asset.name, transaction.asset.unitName, transaction.amount]
  )

  return (
    <div className={cn('space-y-2')}>
      <div className={cn('flex items-center justify-between')}>
        <h1 className={cn('text-2xl text-primary font-bold')}>Asset Transfer</h1>
      </div>
      <DescriptionList items={items} />
    </div>
  )
}
