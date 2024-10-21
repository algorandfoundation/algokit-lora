import { AppCallTransaction, InnerAppCallTransaction } from '@/features/transactions/models'
import { useMemo } from 'react'
import {
  transactionFeeLabel,
  transactionIdLabel,
  transactionRekeyToLabel,
  transactionTypeLabel,
} from '@/features/transactions/components/transaction-info'
import { asTransactionLinkTextComponent, TransactionLink } from '@/features/transactions/components/transaction-link'
import { abiMethodNameLabel, transactionSenderLabel } from '@/features/transactions/components/labels'
import { AccountLink } from '@/features/accounts/components/account-link'
import { applicationIdLabel } from '@/features/applications/components/labels'
import { ApplicationLink } from '@/features/applications/components/application-link'
import { cn } from '@/features/common/utils'
import { DescriptionList } from '@/features/common/components/description-list'
import { TransactionTypeDescriptionDetails } from '@/features/transactions/components/transaction-type-description-details'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { useAtomValue } from 'jotai/index'
import { loadable } from 'jotai/utils'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { AbiMethod } from '@/features/abi-methods/models'

type Props = {
  transaction: AppCallTransaction | InnerAppCallTransaction
  isSimulated: boolean
}

export function AppCallTransactionTooltipContent({ transaction, isSimulated }: Props) {
  const loadableAbiMethod = useAtomValue(loadable(transaction.abiMethod))

  return (
    <RenderLoadable loadable={loadableAbiMethod}>
      {(abiMethod) => <AppCallDescriptionList transaction={transaction} abiMethod={abiMethod} isSimulated={isSimulated} />}
    </RenderLoadable>
  )
}

function AppCallDescriptionList({
  transaction,
  abiMethod,
  isSimulated,
}: Props & {
  abiMethod: AbiMethod | undefined
}) {
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
      ...(abiMethod ? [{ dt: abiMethodNameLabel, dd: abiMethod.name }] : []),
      {
        dt: transactionSenderLabel,
        dd: <AccountLink address={transaction.sender} />,
      },
      {
        dt: applicationIdLabel,
        dd: <ApplicationLink applicationId={transaction.applicationId} />,
      },
      {
        dt: transactionFeeLabel,
        dd: <DisplayAlgo amount={transaction.fee} />,
      },
      ...(transaction.rekeyTo
        ? [
            {
              dt: transactionRekeyToLabel,
              dd: <AccountLink address={transaction.rekeyTo} />,
            },
          ]
        : []),
    ],
    [isSimulated, transaction, abiMethod]
  )

  return (
    <div className={cn('p-4')}>
      <DescriptionList items={items} />
    </div>
  )
}
