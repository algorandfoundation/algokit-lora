import { cn } from '@/features/common/utils'
import { useMemo } from 'react'
import { AssetTransferTransactionModel } from '../models'
import { DescriptionList } from '@/features/common/components/description-list'
import { transactionSenderLabel, transactionReceiverLabel, transactionAmountLabel } from './transaction-view-table'
import { DisplayAssetAmount } from '@/features/common/components/display-asset-amount'

type Props = {
  transaction: AssetTransferTransactionModel
}

export const assetLabel = 'Asset'
export const transactionCloseToLabel = 'Close To'
export const transactionCloseAmountLabel = 'Close Amount'

export function AssetTransferTransactionInfo({ transaction }: Props) {
  const items = useMemo(
    () => [
      {
        dt: transactionSenderLabel,
        dd: (
          <a href="#" className={cn('text-primary underline')}>
            {transaction.sender}
          </a>
        ),
      },
      {
        dt: transactionReceiverLabel,
        dd: (
          <a href="#" className={cn('text-primary underline')}>
            {transaction.receiver}
          </a>
        ),
      },
      {
        dt: assetLabel,
        dd: (
          <a href="#" className={cn('text-primary underline')}>
            {transaction.asset.id} {`${transaction.asset.name ? `(${transaction.asset.name})` : ''}`}
          </a>
        ),
      },
      {
        dt: transactionAmountLabel,
        dd: <DisplayAssetAmount amount={transaction.amount} asset={transaction.asset} />,
      },
      ...(transaction.closeTo && transaction.closeAmount != null
        ? [
            {
              dt: transactionCloseToLabel,
              dd: (
                <a href="#" className={cn('text-primary underline')}>
                  {transaction.closeTo}
                </a>
              ),
            },
            {
              dt: transactionCloseAmountLabel,
              dd: <DisplayAssetAmount amount={transaction.closeAmount} asset={transaction.asset} />,
            },
          ]
        : []),
    ],
    [transaction.sender, transaction.receiver, transaction.asset, transaction.amount, transaction.closeTo, transaction.closeAmount]
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
