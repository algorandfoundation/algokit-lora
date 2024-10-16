import { cn } from '@/features/common/utils'
import { TransactionLink } from './transaction-link'
import { Card, CardContent } from '@/features/common/components/card'
import { ellipseId } from '@/utils/ellipse-id'
import { ellipseAddress } from '@/utils/ellipse-address'
import { DescriptionList } from '@/features/common/components/description-list'
import { ArrowRightLeft, Info } from 'lucide-react'
import { Badge } from '@/features/common/components/badge'
import { TransactionSummary } from '@/features/transactions/models'
import { useLoadableNfdResult } from '@/features/nfd/data/nfd'
import { RenderLoadable } from '@/features/common/components/render-loadable'

export const latestTransactionsTitle = 'Latest Transactions'

type Props = {
  latestTransactions: TransactionSummary[]
}

function Transaction({ transaction }: { transaction: TransactionSummary }) {
  const [loadableNfdFrom] = useLoadableNfdResult(transaction.from)
  const [loadableNfdTo] = useLoadableNfdResult(transaction.to?.toString() ?? '')

  return (
    <li key={transaction.id} className="border-b last:border-0">
      <TransactionLink
        transactionId={transaction.id}
        className="flex w-full gap-2 p-[0.666rem] text-sm animate-in fade-in-20 hover:bg-accent"
      >
        <ArrowRightLeft className="hidden text-primary sm:max-lg:block xl:block" />
        <div>
          <h3 className={cn('leading-none mb-2 tracking-wide')}>{ellipseId(transaction.id)}</h3>
          <DescriptionList
            items={[
              {
                dt: 'From:',
                dd: (
                  <RenderLoadable loadable={loadableNfdFrom} fallback={ellipseAddress(transaction.from)}>
                    {(nfd) => <>{nfd?.name ?? ellipseAddress(transaction.from)}</>}
                  </RenderLoadable>
                ),
              },
              {
                dt: 'To:',
                dd: (
                  <RenderLoadable
                    loadable={loadableNfdTo}
                    fallback={transaction.to && typeof transaction.to === 'string' ? ellipseAddress(transaction.to) : transaction.to}
                  >
                    {(nfd) => (
                      <>
                        {transaction.to && typeof transaction.to === 'string'
                          ? nfd?.name ?? ellipseAddress(transaction.to)
                          : transaction.to}
                      </>
                    )}
                  </RenderLoadable>
                ),
              },
            ]}
          />
        </div>
        <Badge className="ml-auto truncate" variant={transaction.type}>
          {transaction.type}
        </Badge>
      </TransactionLink>
    </li>
  )
}

export function LatestTransactions({ latestTransactions }: Props) {
  return (
    <Card>
      <CardContent className={cn('space-y-1')}>
        <h2>{latestTransactionsTitle}</h2>
        {latestTransactions.length > 0 && (
          <ul>
            {latestTransactions.map((transaction) => (
              <Transaction transaction={transaction} />
            ))}
          </ul>
        )}
        {latestTransactions.length === 0 && (
          <div className="mx-2 flex items-center gap-2 py-3 align-middle">
            <Info />
            <span>No recent data available.</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
