import { cn } from '@/features/common/utils'
import { useMemo } from 'react'
import { AssetTransferTransaction, AssetTransferTransactionSubType, InnerAssetTransferTransaction } from '../models'
import { DescriptionList } from '@/features/common/components/description-list'
import { transactionSenderLabel, transactionReceiverLabel, transactionAmountLabel } from './transactions-table'
import { DisplayAssetAmount } from '@/features/common/components/display-asset-amount'
import { AccountLink } from '@/features/accounts/components/account-link'
import { AssetLink } from '@/features/assets/components/asset-link'
import { useAtomValue } from 'jotai'

type Props = {
  transaction: AssetTransferTransaction | InnerAssetTransferTransaction
}

export const assetLabel = 'Asset'
export const transactionCloseRemainderToLabel = 'Close Remainder To'
export const transactionCloseRemainderAmountLabel = 'Close Remainder Amount'
export const transactionClawbackAddressLabel = 'Clawback From'

export function AssetTransferTransactionInfo({ transaction }: Props) {
  const subType = useAtomValue(transaction.subType)
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
      ...(subType === AssetTransferTransactionSubType.Clawback && transaction.clawbackFrom
        ? [
            {
              dt: transactionClawbackAddressLabel,
              dd: <AccountLink address={transaction.clawbackFrom} />,
            },
          ]
        : []),
      {
        dt: assetLabel,
        dd: <AssetLink asset={transaction.asset} />,
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
        <h1 className={cn('text-2xl text-primary font-bold')}>Asset Transfer</h1>
      </div>
      <DescriptionList items={items} />
    </div>
  )
}
