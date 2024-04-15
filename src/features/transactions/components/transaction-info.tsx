import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { dateFormatter } from '@/utils/format'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { useMemo } from 'react'
import { TransactionModel, SignatureType, TransactionType, AssetTransferTransactionSubType } from '../models'
import { DescriptionList } from '@/features/common/components/description-list'
import { Badge } from '@/features/common/components/badge'

type Props = {
  transaction: TransactionModel
}

export const transactionIdLabel = 'Transaction ID'
export const transactionTypeLabel = 'Type'
export const transactionTimestampLabel = 'Timestamp'
export const transactionBlockLabel = 'Block'
export const transactionGroupLabel = 'Group'
export const transactionFeeLabel = 'Fee'

export function TransactionInfo({ transaction }: Props) {
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
            {transaction.type === TransactionType.AssetTransfer && transaction.subType !== AssetTransferTransactionSubType.Transaction && (
              <Badge className={cn('ml-2')} variant="outline">
                {transaction.subType}
              </Badge>
            )}
            {transaction.signature?.type === SignatureType.Multi && (
              <Badge className={cn('ml-2')} variant="outline">
                Multisig
              </Badge>
            )}
            {transaction.signature?.type === SignatureType.Logic && (
              <Badge className={cn('ml-2')} variant="outline">
                LogicSig
              </Badge>
            )}
          </>
        ),
      },
      {
        dt: transactionTimestampLabel,
        dd: dateFormatter.asLongDateTime(new Date(transaction.roundTime)),
      },
      {
        dt: transactionBlockLabel,
        dd: (
          <a href="#" className={cn('text-primary underline')}>
            {transaction.confirmedRound}
          </a>
        ),
      },
      ...(transaction.group
        ? [
            {
              dt: transactionGroupLabel,
              dd: (
                <a href="#" className={cn('text-primary underline')}>
                  {transaction.group}
                </a>
              ),
            },
          ]
        : []),
      {
        dt: transactionFeeLabel,
        dd: transaction.fee ? <DisplayAlgo amount={transaction.fee} /> : 'N/A',
      },
    ],
    [transaction]
  )

  return (
    <Card className={cn('p-4')}>
      <CardContent className={cn('text-sm space-y-2')}>
        <DescriptionList items={transactionInfoItems} />
      </CardContent>
    </Card>
  )
}
