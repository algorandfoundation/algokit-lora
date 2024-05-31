import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { dateFormatter } from '@/utils/format'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { useMemo } from 'react'
import { Transaction, SignatureType, InnerTransaction } from '../models'
import { DescriptionList } from '@/features/common/components/description-list'
import { Badge } from '@/features/common/components/badge'
import { BlockLink } from '@/features/blocks/components/block-link'
import { GroupLink } from '@/features/groups/components/group-link'
import { useAtomValue } from 'jotai'
import { AccountLink } from '@/features/accounts/components/account-link'

type Props = {
  transaction: Transaction | InnerTransaction
}

export const transactionIdLabel = 'Transaction ID'
export const transactionTypeLabel = 'Type'
export const transactionTimestampLabel = 'Timestamp'
export const transactionBlockLabel = 'Block'
export const transactionGroupLabel = 'Group'
export const transactionFeeLabel = 'Fee'
export const transactionRekeyToLabel = 'Rekey To'

export function TransactionInfo({ transaction }: Props) {
  const subType = useAtomValue(transaction.subType)
  const transactionInfoItems = useMemo(
    () => [
      {
        dt: transactionIdLabel,
        dd: transaction.id,
      },
      {
        dt: transactionTypeLabel,
        dd: (
          <>
            {transaction.type}
            {subType && <Badge variant="outline">{subType}</Badge>}
            {transaction.signature?.type === SignatureType.Multi && <Badge variant="outline">Multisig</Badge>}
            {transaction.signature?.type === SignatureType.Logic && <Badge variant="outline">LogicSig</Badge>}
            {transaction.rekeyTo && <Badge variant="outline">Rekey</Badge>}
          </>
        ),
      },
      {
        dt: transactionTimestampLabel,
        dd: dateFormatter.asLongDateTime(new Date(transaction.roundTime)),
      },
      {
        dt: transactionBlockLabel,
        dd: <BlockLink round={transaction.confirmedRound} />,
      },
      ...(transaction.group
        ? [
            {
              dt: transactionGroupLabel,
              dd: <GroupLink round={transaction.confirmedRound} groupId={transaction.group} />,
            },
          ]
        : []),
      {
        dt: transactionFeeLabel,
        dd: transaction.fee ? <DisplayAlgo amount={transaction.fee} /> : 'N/A',
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
    [
      subType,
      transaction.confirmedRound,
      transaction.fee,
      transaction.group,
      transaction.id,
      transaction.rekeyTo,
      transaction.roundTime,
      transaction.signature?.type,
      transaction.type,
    ]
  )

  return (
    <Card className={cn('p-4')}>
      <CardContent className={cn('text-sm space-y-2')}>
        <DescriptionList items={transactionInfoItems} />
      </CardContent>
    </Card>
  )
}
