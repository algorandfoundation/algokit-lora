import { cn } from '@/features/common/utils'
import { useMemo } from 'react'
import { AssetTransferTransaction, AssetTransferTransactionSubType, InnerAssetTransferTransaction } from '../models'
import { DescriptionList } from '@/features/common/components/description-list'
import { DisplayAssetAmount } from '@/features/common/components/display-asset-amount'
import { AccountLink } from '@/features/accounts/components/account-link'
import { AssetLink } from '@/features/assets/components/asset-link'
import { transactionAmountLabel } from './transactions-table-columns'
import { transactionReceiverLabel, transactionSenderLabel } from './labels'

type Props = {
  transaction: AssetTransferTransaction | InnerAssetTransferTransaction
}

export const assetLabel = 'Asset'
export const transactionCloseRemainderToLabel = 'Close Remainder To'
export const transactionCloseRemainderAmountLabel = 'Close Remainder Amount'
export const transactionClawbackAddressLabel = 'Clawback From'

export function AssetTransferTransactionInfo({ transaction }: Props) {
  const subType = transaction.subType
  const items = useMemo(
    () => [
      {
        dt: transactionSenderLabel,
        dd: <AccountLink address={transaction.sender} showCopyButton={true} />,
      },
      ...(subType === AssetTransferTransactionSubType.Clawback && transaction.clawbackFrom
        ? [
            {
              dt: transactionClawbackAddressLabel,
              dd: <AccountLink address={transaction.clawbackFrom} showCopyButton={true} />,
            },
          ]
        : []),
      {
        dt: transactionReceiverLabel,
        dd: <AccountLink address={transaction.receiver} showCopyButton={true} />,
      },
      {
        dt: assetLabel,
        dd: <AssetLink asset={transaction.asset} showCopyButton={true} />,
      },
      {
        dt: transactionAmountLabel,
        dd: <DisplayAssetAmount amount={transaction.amount} asset={transaction.asset} />,
      },
      ...(transaction.closeRemainder
        ? [
            {
              dt: transactionCloseRemainderToLabel,
              dd: <AccountLink address={transaction.closeRemainder.to} showCopyButton={true} />,
            },
            {
              dt: transactionCloseRemainderAmountLabel,
              dd: <DisplayAssetAmount amount={transaction.closeRemainder.amount} asset={transaction.asset} />,
            },
          ]
        : []),
    ],
    [
      subType,
      transaction.amount,
      transaction.asset,
      transaction.clawbackFrom,
      transaction.closeRemainder,
      transaction.receiver,
      transaction.sender,
    ]
  )

  return (
    <div className={cn('space-y-2')}>
      <div className={cn('flex items-center justify-between')}>
        <h2>Asset Transfer</h2>
      </div>
      <DescriptionList items={items} />
    </div>
  )
}
