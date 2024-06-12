import { cn } from '@/features/common/utils'
import { TransactionLink } from './transaction-link'
import { Card, CardContent } from '@/features/common/components/card'
import { useLatestTransactionSummaries } from '../data/latest-transactions'
import { ellipseId } from '@/utils/ellipse-id'
import { ellipseAddress } from '@/utils/ellipse-address'
import { DescriptionList } from '@/features/common/components/description-list'
import { ArrowRightLeft } from 'lucide-react'

export const latestTransactionsTitle = 'Latest Transactions'

export function LatestTransactions() {
  const latestTransactions = useLatestTransactionSummaries()

  return (
    <Card className={cn('p-4')}>
      <CardContent className={cn('text-sm space-y-2')}>
        <h2>{latestTransactionsTitle}</h2>
        <div className={cn('grid grid-cols-1 gap-3')}>
          {latestTransactions.map((transaction) => (
            <TransactionLink key={transaction.id} transactionId={transaction.id}>
              <div className="flex border-b px-2 pb-2 text-sm">
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
                <span className={cn('ml-auto')}>{transaction.type}</span>
              </div>
            </TransactionLink>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
