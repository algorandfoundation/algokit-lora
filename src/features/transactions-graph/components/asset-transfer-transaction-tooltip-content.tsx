import { AssetTransferTransaction, AssetTransferTransactionSubType, InnerAssetTransferTransaction } from '@/features/transactions/models'
import { useMemo } from 'react'
import {
  transactionFeeLabel,
  transactionIdLabel,
  transactionRekeyToLabel,
  transactionTypeLabel,
} from '@/features/transactions/components/transaction-info'
import { asTransactionLinkTextComponent, TransactionLink } from '@/features/transactions/components/transaction-link'
import { transactionReceiverLabel, transactionSenderLabel } from '@/features/transactions/components/labels'
import { AccountLink } from '@/features/accounts/components/account-link'
import { transactionAmountLabel } from '@/features/transactions/components/transactions-table-columns'
import { DisplayAssetAmount } from '@/features/common/components/display-asset-amount'
import { cn } from '@/features/common/utils'
import { DescriptionList } from '@/features/common/components/description-list'
import { TransactionTypeDescriptionDetails } from '@/features/transactions/components/transaction-type-description-details'
import {
  transactionClawbackAddressLabel,
  transactionCloseRemainderAmountLabel,
  transactionCloseRemainderToLabel,
} from '@/features/transactions/components/asset-transfer-transaction-info'
import { DisplayAlgo } from '@/features/common/components/display-algo'

type Props = {
  transaction: AssetTransferTransaction | InnerAssetTransferTransaction
  isSimulated: boolean
}

export function AssetTransferTransactionTooltipContent({ transaction, isSimulated }: Props) {
  const items = useMemo(
    () => [
      {
        dt: transactionIdLabel,
        dd: isSimulated ? asTransactionLinkTextComponent(transaction.id, true) : <TransactionLink transactionId={transaction.id} />,
      },
      {
        dt: transactionTypeLabel,
        dd: <TransactionTypeDescriptionDetails transaction={transaction} />,
      },
      {
        dt: transactionSenderLabel,
        dd: <AccountLink address={transaction.sender} />,
      },
      ...(transaction.subType === AssetTransferTransactionSubType.Clawback && transaction.clawbackFrom
        ? [
            {
              dt: transactionClawbackAddressLabel,
              dd: <AccountLink address={transaction.clawbackFrom} />,
            },
          ]
        : []),
      {
        dt: transactionReceiverLabel,
        dd: <AccountLink address={transaction.receiver} />,
      },
      {
        dt: transactionAmountLabel,
        dd: <DisplayAssetAmount asset={transaction.asset} amount={transaction.amount} />,
      },
      {
        dt: transactionFeeLabel,
        dd: <DisplayAlgo amount={transaction.fee} />,
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
      ...(transaction.rekeyTo
        ? [
            {
              dt: transactionRekeyToLabel,
              dd: <AccountLink address={transaction.rekeyTo} />,
            },
          ]
        : []),
    ],
    [isSimulated, transaction]
  )

  return (
    <div className={cn('p-4')}>
      <DescriptionList items={items} />
    </div>
  )
}
