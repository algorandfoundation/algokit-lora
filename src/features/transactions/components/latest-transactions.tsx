import { cn } from '@/features/common/utils'
import { TransactionLink } from './transaction-link'
import { Card, CardContent } from '@/features/common/components/card'
import SvgTransaction from '@/features/common/components/icons/transaction'
import { useLatestTransactionSummaries } from '../data/latest-transactions'
import { ellipseId } from '@/utils/ellipse-id'
import { ellipseAddress } from '@/utils/ellipse-address'
import { DescriptionList } from '@/features/common/components/description-list'

export const latestTransactionsTitle = 'Latest Transactions'

export function LatestTransactions() {
  const latestTransactions = useLatestTransactionSummaries()

  return (
    <div className={cn('space-y-6 pt-7')}>
      <Card className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-2')}>
          <h2 className={cn('text-xl text-primary font-bold')}>{latestTransactionsTitle}</h2>
          <div className={cn('grid grid-cols-1 gap-3')}>
            {latestTransactions.map((transaction) => (
              <TransactionLink key={transaction.id} transactionId={transaction.id}>
                <Card className={cn('p-4')}>
                  <CardContent className={cn('text-sm flex')}>
                    <SvgTransaction className={cn('size-6')} />
                    <div className={cn('mx-2')}>
                      <h3 className={cn('text-xl leading-none font-bold mb-2')}>{ellipseId(transaction.id)}</h3>
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
                  </CardContent>
                </Card>
              </TransactionLink>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
