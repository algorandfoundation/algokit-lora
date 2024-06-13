import { cn } from '@/features/common/utils'
import { TransactionLink } from './transaction-link'
import { Card, CardContent } from '@/features/common/components/card'
import { useLatestTransactionSummaries } from '../data/latest-transactions'
import { ellipseId } from '@/utils/ellipse-id'
import { ellipseAddress } from '@/utils/ellipse-address'
import { DescriptionList } from '@/features/common/components/description-list'
import { ArrowRightLeft } from 'lucide-react'
import { Badge } from '@/features/common/components/badge'

export const latestTransactionsTitle = 'Latest Transactions'

export function LatestTransactions() {
  const latestTransactions = useLatestTransactionSummaries()

  return (
    <Card className={cn('p-4')}>
      <CardContent className={cn('text-sm')}>
        <h2>{latestTransactionsTitle}</h2>
        <ul className={cn('grid grid-cols-1')}>
          {latestTransactions.map((transaction) => (
            <li key={transaction.id} className="border-b last:border-0">
              <TransactionLink transactionId={transaction.id} className="flex p-[0.705rem] text-sm hover:bg-accent">
                <ArrowRightLeft className="text-primary" />
                <div className={cn('mx-2')}>
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
                <div className="ml-auto">
                  <Badge variant={transaction.type}>{transaction.type}</Badge>
                </div>
              </TransactionLink>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
