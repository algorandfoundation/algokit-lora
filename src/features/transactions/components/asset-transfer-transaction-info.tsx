import { cn } from '@/features/common/utils'
import { useMemo } from 'react'
import { AssetTransferTransaction, AssetTransferTransactionSubType, InnerAssetTransferTransaction } from '../models'
import { DescriptionList } from '@/features/common/components/description-list'
import { transactionSenderLabel, transactionReceiverLabel, transactionAmountLabel } from './transaction-view-table'
import { DisplayAssetAmount } from '@/features/common/components/display-asset-amount'
import { AccountLink } from '@/features/accounts/components/account-link'
import { AssetLink } from '@/features/assets/components/asset-link'

type Props = {
  transaction: AssetTransferTransaction | InnerAssetTransferTransaction
}

export const assetLabel = 'Asset'
export const transactionCloseRemainderToLabel = 'Close Remainder To'
export const transactionCloseRemainderAmountLabel = 'Close Remainder Amount'
export const transactionClawbackAddressLabel = 'Clawback From'

export function AssetTransferTransactionInfo({ transaction }: Props) {
  const items = useMemo(
    () => [
      {
        dt: transactionSenderLabel,
        dd: <AccountLink address={transaction.sender} />,
      },
      {
        dt: transactionReceiverLabel,
        dd: <AccountLink address={transaction.receiver} />,
      },
      ...(transaction.subType === AssetTransferTransactionSubType.Clawback
        ? [
            {
              dt: transactionClawbackAddressLabel,
              dd: (
                <a href="#" className={cn('text-primary underline')}>
                  {transaction.clawbackFrom}
                </a>
              ),
            },
          ]
        : []),
      {
        dt: assetLabel,
        dd: <AssetLink assetId={transaction.asset.id} assetName={transaction.asset.name} />,
      },
      {
        dt: transactionAmountLabel,
        dd: <DisplayAssetAmount amount={transaction.amount} asset={transaction.asset} />,
      },
      ...(transaction.closeRemainder
        ? [
            {
              dt: transactionCloseRemainderToLabel,
              dd: <AccountLink address={transaction.closeRemainder.to} />,
            },
            {
              dt: transactionCloseRemainderAmountLabel,
              dd: <DisplayAssetAmount amount={transaction.closeRemainder.amount} asset={transaction.asset} />,
            },
          ]
        : []),
    ],
    [
      transaction.amount,
      transaction.asset,
      transaction.clawbackFrom,
      transaction.closeRemainder,
      transaction.receiver,
      transaction.sender,
      transaction.subType,
    ]
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
