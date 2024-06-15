import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { useMemo } from 'react'
import { Transaction, SignatureType, InnerTransaction } from '../models'
import { DescriptionList } from '@/features/common/components/description-list'
import { Badge } from '@/features/common/components/badge'
import { BlockLink } from '@/features/blocks/components/block-link'
import { GroupLink } from '@/features/groups/components/group-link'
import { useAtomValue } from 'jotai'
import { AccountLink } from '@/features/accounts/components/account-link'
import { TransactionLink } from './transaction-link'
import { DateFormatted } from '@/features/common/components/date-formatted'
import { OpenJsonViewDialogButton } from '@/features/common/components/json-view-dialog-button'

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
        dd: <TransactionLink transactionId={transaction.id} showCopyButton={true} />,
      },
      {
        dt: transactionTypeLabel,
        dd: (
          <div className="flex items-center gap-2">
            <Badge variant={transaction.type}>{transaction.type}</Badge>
            {subType && <Badge variant="outline">{subType}</Badge>}
            {transaction.signature?.type === SignatureType.Multi && <Badge variant="outline">Multisig</Badge>}
            {transaction.signature?.type === SignatureType.Logic && <Badge variant="outline">LogicSig</Badge>}
            {transaction.rekeyTo && <Badge variant="outline">Rekey</Badge>}
          </div>
        ),
      },
      {
        dt: transactionTimestampLabel,
        dd: <DateFormatted date={new Date(transaction.roundTime)} />,
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
        <div className={cn('grid grid-cols-[1fr_max-content]')}>
          <DescriptionList items={transactionInfoItems} />
          <OpenJsonViewDialogButton json={transaction.json} />
        </div>
      </CardContent>
    </Card>
  )
}
