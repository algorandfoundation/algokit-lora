import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { useMemo } from 'react'
import { Transaction, InnerTransaction } from '../models'
import { DescriptionList } from '@/features/common/components/description-list'
import { BlockLink } from '@/features/blocks/components/block-link'
import { GroupLink } from '@/features/groups/components/group-link'
import { AccountLink } from '@/features/accounts/components/account-link'
import { TransactionLink } from './transaction-link'
import { DateFormatted } from '@/features/common/components/date-formatted'
import { OpenJsonViewDialogButton } from '@/features/common/components/json-view-dialog-button'
import { InnerTransactionLink, asInnerTransactionLinkText } from '@/features/transactions/components/inner-transaction-link'
import { TransactionTypeDescriptionDetails } from '@/features/transactions/components/transaction-type-description-details'
import { CopyButton } from '@/features/common/components/copy-button'

type Props = {
  transaction: Transaction | InnerTransaction
}

export const transactionIdLabel = 'Transaction ID'
export const parentTransactionIdLabel = 'Parent Transaction ID'
export const transactionTypeLabel = 'Type'
export const transactionTimestampLabel = 'Timestamp'
export const transactionBlockLabel = 'Block'
export const transactionFeeLabel = 'Fee'
export const transactionGroupLabel = 'Group'
export const transactionRekeyToLabel = 'Rekey To'

export function TransactionInfo({ transaction }: Props) {
  const isInnerTransaction = 'innerId' in transaction

  const parentTransactionLink = useMemo(() => {
    if (!isInnerTransaction) {
      return undefined
    }

    const segments = transaction.innerId.split('/')
    if (segments.length === 1) {
      return {
        dt: parentTransactionIdLabel,
        dd: <TransactionLink transactionId={transaction.networkTransactionId} showCopyButton={true} />,
      }
    } else {
      const parentInnerId = segments.slice(0, segments.length - 1).join('/')
      return {
        dt: parentTransactionIdLabel,
        dd: (
          <InnerTransactionLink
            networkTransactionId={transaction.networkTransactionId}
            innerTransactionId={parentInnerId}
            showFullTransactionId={true}
          />
        ),
      }
    }
  }, [transaction, isInnerTransaction])

  const transactionInfoItems = useMemo(
    () => [
      {
        dt: transactionIdLabel,
        dd: !isInnerTransaction ? (
          <div className="flex items-center">
            <span className="truncate">{transaction.id}</span>
            <CopyButton value={transaction.id} />
          </div>
        ) : (
          <span className="truncate">{asInnerTransactionLinkText(transaction.networkTransactionId, transaction.innerId, true)}</span>
        ),
      },
      ...(parentTransactionLink ? [parentTransactionLink] : []),
      {
        dt: transactionTypeLabel,
        dd: <TransactionTypeDescriptionDetails transaction={transaction} />,
      },
      {
        dt: transactionTimestampLabel,
        dd: <DateFormatted date={new Date(transaction.roundTime)} />,
      },
      {
        dt: transactionBlockLabel,
        dd: <BlockLink round={transaction.confirmedRound} />,
      },
      {
        dt: transactionFeeLabel,
        dd: <DisplayAlgo amount={transaction.fee} />,
      },
      ...(transaction.group
        ? [
            {
              dt: transactionGroupLabel,
              dd: <GroupLink round={transaction.confirmedRound} groupId={transaction.group} />,
            },
          ]
        : []),
      ...(transaction.rekeyTo
        ? [
            {
              dt: transactionRekeyToLabel,
              dd: <AccountLink address={transaction.rekeyTo} showCopyButton={true} />,
            },
          ]
        : []),
    ],
    [isInnerTransaction, parentTransactionLink, transaction]
  )

  return (
    <Card>
      <CardContent>
        <div className={cn('flex gap-2')}>
          <DescriptionList items={transactionInfoItems} />
          <OpenJsonViewDialogButton json={transaction.json} />
        </div>
      </CardContent>
    </Card>
  )
}
