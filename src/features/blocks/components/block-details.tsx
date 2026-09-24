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
import { AccountLink } from '@/features/accounts/components/account-link'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { formatDecimalAmount } from '@/utils/number-format'
import Decimal from 'decimal.js'

const loadDecimals = 6 // The load is a fixed-point integer, where 1,000,000 is a completely full block

type Props = {
  block: Block
}

export const roundLabel = 'Round'
export const timestampLabel = 'Timestamp'
export const transactionsLabel = 'Transactions'
export const previousRoundLabel = 'Previous Round'
export const nextRoundLabel = 'Next Round'
export const proposerLabel = 'Proposer'
export const loadLabel = 'Load'
export const congestionTaxLabel = 'Congestion Tax'

export function BlockDetails({ block }: Props) {
  const blockItems = useMemo(
    () => [
      {
        dt: roundLabel,
        dd: (
          <div className="flex items-center">
            <span className="truncate">{block.round.toString()}</span>
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
      ...(block.load
        ? [
            {
              dt: loadLabel,
              dd: formatDecimalAmount(new Decimal(block.load.toString()).div(new Decimal(10).pow(loadDecimals))),
            },
          ]
        : []),
      ...(block.congestionTax
        ? [
            {
              dt: congestionTaxLabel,
              dd: <DisplayAlgo amount={block.congestionTax} />,
            },
          ]
        : []),
      ...(block.proposer
        ? [
            {
              dt: proposerLabel,
              dd: <AccountLink address={block.proposer} showCopyButton={true} showQRButton={true} />,
            },
          ]
        : []),
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
      block.congestionTax,
      block.load,
      block.nextRound,
      block.previousRound,
      block.proposer,
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
