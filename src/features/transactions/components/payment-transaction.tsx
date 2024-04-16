import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { TransactionInfo } from './transaction-info'
import { TransactionNote } from './transaction-note'
import { TransactionJson } from './transaction-json'
import { SignatureType } from '../models'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { TransactionViewVisual } from './transaction-view-visual'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/features/common/components/tabs'
import { TransactionViewTable } from './transaction-view-table'
import { Multisig } from './multisig'
import { Logicsig } from './logicsig'
import { usePaymentTransaction } from '../data'
import { PaymentTransactionInfo } from './payment-transaction-info'

type PaymentTransactionProps = {
  transactionResult: TransactionResult
}

const visualTransactionDetailsTabId = 'visual'
const tableTransactionDetailsTabId = 'table'
export const transactionDetailsLabel = 'View Transaction Details'
export const visualTransactionDetailsTabLabel = 'Visual'
export const tableTransactionDetailsTabLabel = 'Table'

export function PaymentTransaction({ transactionResult }: PaymentTransactionProps) {
  const paymentTransaction = usePaymentTransaction(transactionResult)

  return (
    <div className={cn('space-y-6 pt-7')}>
      <TransactionInfo transaction={paymentTransaction} />
      <Card className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-4')}>
          <PaymentTransactionInfo transaction={paymentTransaction} />
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
              <TransactionViewVisual transaction={paymentTransaction} />
            </TabsContent>
            <TabsContent value={tableTransactionDetailsTabId} className={cn('border-solid border-2 border-border p-4')}>
              <TransactionViewTable transaction={paymentTransaction} />
            </TabsContent>
          </Tabs>
          {paymentTransaction.note && <TransactionNote note={paymentTransaction.note} />}
          <TransactionJson transaction={transactionResult} />
          {paymentTransaction.signature?.type === SignatureType.Multi && <Multisig signature={paymentTransaction.signature} />}
          {paymentTransaction.signature?.type === SignatureType.Logic && <Logicsig signature={paymentTransaction.signature} />}
        </CardContent>
      </Card>
    </div>
  )
}
