import { Card, CardContent } from '@/features/common/components/card'
import { DescriptionList } from '@/features/common/components/description-list'
import { useMemo } from 'react'
import { cn } from '@/features/common/utils'
import { BlockLink } from './block-link'
import { Block } from '../models'
import { Badge } from '@/features/common/components/badge'
import { RenderInlineAsyncAtom } from '@/features/common/components/render-inline-async-atom'
import { TransactionsTable } from '@/features/transactions/components/transactions-table'
import { transactionsTableColumnsWithoutRound } from '@/features/transactions/components/transactions-table-columns'
import { DateFormatted } from '@/features/common/components/date-formatted'
import { CopyButton } from '@/features/common/components/copy-button'
import { OpenJsonViewDialogButton } from '@/features/common/components/json-view-dialog-button'

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
        dd: (
          <div className="flex items-center">
            <span className="truncate">{block.round}</span>
            <CopyButton value={block.round.toString()} />
          </div>
        ),
      },
      {
        dt: timestampLabel,
        dd: <DateFormatted date={new Date(block.timestamp)} />,
      },
      {
        dt: transactionsLabel,
        dd: (
          <div className="flex flex-wrap items-center gap-2">
            <span>{block.transactionsSummary.count}</span>
            {block.transactionsSummary.countByType.map(([type, count]) => (
              <Badge key={type} variant={type}>
                {type}={count}
              </Badge>
            ))}
          </div>
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
      <Card>
        <CardContent>
          <div className={cn('flex gap-2')}>
            <DescriptionList items={blockItems} />
            <OpenJsonViewDialogButton json={block.json} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className={cn('space-y-1')}>
          <h2>{transactionsLabel}</h2>
          <TransactionsTable transactions={block.transactions} columns={transactionsTableColumnsWithoutRound} subRowsExpanded={false} />
        </CardContent>
      </Card>
    </div>
  )
}
