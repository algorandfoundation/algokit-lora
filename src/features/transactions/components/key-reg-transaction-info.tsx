import { cn } from '@/features/common/utils'
import { useMemo } from 'react'
import { KeyRegTransaction, InnerKeyRegTransaction, KeyRegTransactionSubType } from '../models'
import { DescriptionList } from '@/features/common/components/description-list'
import { AccountLink } from '@/features/accounts/components/account-link'
import { isDefined } from '@/utils/is-defined'
import { transactionSenderLabel } from './labels'

type Props = {
  transaction: KeyRegTransaction | InnerKeyRegTransaction
}

export const voteParticipationKeyLabel = 'Voting Key'
export const selectionParticipationKeyLabel = 'Selection Key'
export const stateProofKeyLabel = 'State Proof Key'
export const voteFirstValidLabel = 'First Voting Round'
export const voteLastValidLabel = 'Last Voting Round'
export const voteKeyDilutionLabel = 'Vote Key Dilution'

export function KeyRegTransactionInfo({ transaction }: Props) {
  const items = useMemo(
    () =>
      [
        {
          dt: transactionSenderLabel,
          dd: <AccountLink address={transaction.sender} showCopyButton={true} />,
        },
        transaction.voteParticipationKey
          ? {
              dt: voteParticipationKeyLabel,
              dd: transaction.voteParticipationKey,
            }
          : undefined,
        transaction.selectionParticipationKey
          ? {
              dt: selectionParticipationKeyLabel,
              dd: transaction.selectionParticipationKey,
            }
          : undefined,
        transaction.stateProofKey
          ? {
              dt: stateProofKeyLabel,
              dd: transaction.stateProofKey,
            }
          : undefined,
        ...(transaction.subType === KeyRegTransactionSubType.Online
          ? [
              {
                dt: voteFirstValidLabel,
                dd: transaction.voteFirstValid,
              },
              {
                dt: voteLastValidLabel,
                dd: transaction.voteLastValid,
              },
              {
                dt: voteKeyDilutionLabel,
                dd: transaction.voteKeyDilution,
              },
            ]
          : []),
      ].filter(isDefined),
    [
      transaction.selectionParticipationKey,
      transaction.sender,
      transaction.stateProofKey,
      transaction.subType,
      transaction.voteFirstValid,
      transaction.voteKeyDilution,
      transaction.voteLastValid,
      transaction.voteParticipationKey,
    ]
  )

  return (
    <div className={cn('space-y-1')}>
      <h2>Key Registration</h2>
      <DescriptionList items={items} />
    </div>
  )
}
