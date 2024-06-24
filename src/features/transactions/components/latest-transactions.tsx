import { cn } from '@/features/common/utils'
import { TransactionLink } from './transaction-link'
import { Card, CardContent } from '@/features/common/components/card'
import { useLatestTransactionSummaries } from '../data/latest-transactions'
import { ellipseId } from '@/utils/ellipse-id'
import { ellipseAddress } from '@/utils/ellipse-address'
import { DescriptionList } from '@/features/common/components/description-list'
import { ArrowRightLeft, Info } from 'lucide-react'
import { Badge } from '@/features/common/components/badge'

export const latestTransactionsTitle = 'Latest Transactions'

export function LatestTransactions() {
  const latestTransactions = useLatestTransactionSummaries()

  return (
    <Card className={cn('px-4 pb-4 pt-2.5')}>
      <CardContent className={cn('text-sm space-y-1')}>
        <h2>{latestTransactionsTitle}</h2>
        {latestTransactions.length > 0 && (
          <ul>
            {latestTransactions.map((transaction) => (
              <li key={transaction.id} className="border-b last:border-0">
                <TransactionLink
                  transactionId={transaction.id}
                  className="flex w-full gap-2 p-[0.666rem] text-sm animate-in fade-in-20 hover:bg-accent"
                >
                  <ArrowRightLeft className="hidden text-primary sm:max-lg:block xl:block" />
                  <div>
                    <h3 className={cn('leading-none mb-2')}>{ellipseId(transaction.id)}</h3>
                    <DescriptionList
                      items={[
                        { dt: 'From:', dd: ellipseAddress(transaction.from) },
                        {
                          dt: 'To:',
                          dd: transaction.to && typeof transaction.to === 'string' ? ellipseAddress(transaction.to) : transaction.to,
                        },
                      ]}
                    />
                  </div>
                  <Badge className="ml-auto truncate" variant={transaction.type}>
                    {transaction.type}
                  </Badge>
                </TransactionLink>
              </li>
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
