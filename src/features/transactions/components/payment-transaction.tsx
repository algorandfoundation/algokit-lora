import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { TransactionInfo } from './transaction-info'
import { TransactionNote } from './transaction-note'
import { TransactionJson } from './transaction-json'
import { SignatureType, PaymentTransactionModel } from '../models'
import { TransactionViewVisual } from './transaction-view-visual'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/features/common/components/tabs'
import { TransactionViewTable } from './transaction-view-table'
import { Multisig } from './multisig'
import { Logicsig } from './logicsig'
import { PaymentTransactionInfo } from './payment-transaction-info'

type PaymentTransactionProps = {
  transaction: PaymentTransactionModel
}

const visualTransactionDetailsTabId = 'visual'
const tableTransactionDetailsTabId = 'table'
export const transactionDetailsLabel = 'View Transaction Details'
export const visualTransactionDetailsTabLabel = 'Visual'
export const tableTransactionDetailsTabLabel = 'Table'

export function PaymentTransaction({ transaction }: PaymentTransactionProps) {
  return (
    <div className={cn('space-y-6 pt-7')}>
      <TransactionInfo transaction={transaction} />
      <Card className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-4')}>
          <PaymentTransactionInfo transaction={transaction} />
          <Tabs defaultValue={visualTransactionDetailsTabId}>
            <TabsList aria-label={transactionDetailsLabel}>
              <TabsTrigger
                className={cn('data-[state=active]:border-primary data-[state=active]:border-b-2 w-32')}
                value={visualTransactionDetailsTabId}
              >
                {visualTransactionDetailsTabLabel}
              </TabsTrigger>
              <TabsTrigger
                className={cn('data-[state=active]:border-primary data-[state=active]:border-b-2 w-32')}
                value={tableTransactionDetailsTabId}
              >
                {tableTransactionDetailsTabLabel}
              </TabsTrigger>
            </TabsList>
            <TabsContent value={visualTransactionDetailsTabId} className={cn('border-solid border-2 border-border p-4')}>
              <TransactionViewVisual transaction={transaction} />
            </TabsContent>
            <TabsContent value={tableTransactionDetailsTabId} className={cn('border-solid border-2 border-border p-4')}>
              <TransactionViewTable transaction={transaction} />
            </TabsContent>
          </Tabs>
          {transaction.note && <TransactionNote note={transaction.note} />}
          <TransactionJson json={transaction.json} />
          {transaction.signature?.type === SignatureType.Multi && <Multisig signature={transaction.signature} />}
          {transaction.signature?.type === SignatureType.Logic && <Logicsig signature={transaction.signature} />}
        </CardContent>
      </Card>
    </div>
  )
}
