import { asBlockModel } from '../mappers'
import { BlockMetadata } from '../data'
import { Card, CardContent } from '@/features/common/components/card'
import { DescriptionList } from '@/features/common/components/description-list'
import { useMemo } from 'react'
import { cn } from '@/features/common/utils'
import { dateFormatter } from '@/utils/format'
import { BlockLink } from './block-link'
import { TransactionsTable } from './transactions'
import { useTransactions } from '@/features/transactions/data'
import { asPaymentTransaction } from '@/features/transactions/mappers/transaction-mappers'
import { TransactionType } from 'algosdk'

type Props = {
  block: BlockMetadata
}

export const roundLabel = 'Round'
export const timestampLabel = 'Timestamp'
export const transactionsLabel = 'Transactions'
export const previousRoundLabel = 'Previous Round'
export const nextRoundLabel = 'Next Round'

export function Block({ block }: Props) {
  const blockModel = asBlockModel(block)
  // TODO: NC - Remove filter once we support other transaction types
  // TODO: NC - Currently we re-render this view when new transactions are added, which results in the table pagination loosing it's position. A future block refactor will fix this issue.
  const transactions = useTransactions(blockModel.transactionIds)
    .filter((t) => t['tx-type'] === TransactionType.pay)
    .map(asPaymentTransaction)

  const blockItems = useMemo(
    () => [
      {
        dt: roundLabel,
        dd: blockModel.round,
      },
      {
        dt: timestampLabel,
        dd: dateFormatter.asLongDateTime(new Date(blockModel.timestamp)),
      },
      {
        dt: transactionsLabel,
        dd: (
          <>
            {blockModel.transactionCount}
            {/* TODO: NC - Badges will be added as part of a subsequent PR, once block refactoring has been done. */}
            {/* <Badge>Pay=12</Badge>
            <Badge variant="destructive">Transfer=12</Badge> */}
          </>
        ),
      },
      ...(blockModel.round > 0
        ? [
            {
              dt: previousRoundLabel,
              dd: <BlockLink round={blockModel.round - 1} />,
            },
          ]
        : []),
      // TODO: NC - Only display this link if the next round is available
      {
        dt: nextRoundLabel,
        dd: <BlockLink round={blockModel.round + 1} />,
      },
    ],
    [blockModel.round, blockModel.timestamp, blockModel.transactionCount]
  )

  return (
    <div className={cn('space-y-6 pt-7')}>
      <Card className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-2')}>
          <DescriptionList items={blockItems} />
        </CardContent>
      </Card>
      <Card className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-2')}>
          <h1 className={cn('text-2xl text-primary font-bold')}>{transactionsLabel}</h1>
          <TransactionsTable transactions={transactions} />
        </CardContent>
      </Card>
    </div>
  )
}
