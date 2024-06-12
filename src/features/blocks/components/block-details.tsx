import { Card, CardContent } from '@/features/common/components/card'
import { DescriptionList } from '@/features/common/components/description-list'
import { useMemo } from 'react'
import { cn } from '@/features/common/utils'
import { dateFormatter } from '@/utils/format'
import { BlockLink } from './block-link'
import { Block } from '../models'
import { Badge } from '@/features/common/components/badge'
import { RenderInlineAsyncAtom } from '@/features/common/components/render-inline-async-atom'
import { TransactionsTable } from '@/features/transactions/components/transactions-table'
import { transactionsTableColumnsWithoutRound } from '@/features/transactions/components/transactions-table-columns'

type Props = {
  block: Block
}

export const roundLabel = 'Round'
export const timestampLabel = 'Timestamp'
export const transactionsLabel = 'Transactions'
export const previousRoundLabel = 'Previous Round'
export const nextRoundLabel = 'Next Round'

export function BlockDetails({ block }: Props) {
  const blockItems = useMemo(
    () => [
      {
        dt: roundLabel,
        dd: block.round,
      },
      {
        dt: timestampLabel,
        dd: dateFormatter.asLongDateTime(new Date(block.timestamp)),
      },
      {
        dt: transactionsLabel,
        dd: (
          <>
            {block.transactionsSummary.count}
            {block.transactionsSummary.countByType.map(([type, count]) => (
              <Badge key={type} variant="outline">
                {type}={count}
              </Badge>
            ))}
          </>
        ),
      },
      {
        dt: previousRoundLabel,
        dd: block.previousRound !== undefined ? <BlockLink round={block.previousRound} /> : undefined,
      },
      {
        dt: nextRoundLabel,
        dd: <RenderInlineAsyncAtom atom={block.nextRound}>{(nextRound) => <BlockLink round={nextRound} />}</RenderInlineAsyncAtom>,
      },
    ],
    [
      block.nextRound,
      block.previousRound,
      block.round,
      block.timestamp,
      block.transactionsSummary.count,
      block.transactionsSummary.countByType,
    ]
  )

  return (
    <div className={cn('space-y-4')}>
      <Card className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-2')}>
          <DescriptionList items={blockItems} />
        </CardContent>
      </Card>
      <Card className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-2')}>
          <h2>{transactionsLabel}</h2>
          <TransactionsTable transactions={block.transactions} columns={transactionsTableColumnsWithoutRound} subRowsExpanded={false} />
        </CardContent>
      </Card>
    </div>
  )
}
