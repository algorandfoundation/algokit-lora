import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { TransactionInfo } from './transaction-info'
import { TransactionNote } from './transaction-note'
import { TransactionJson } from './transaction-json'
import { useMemo } from 'react'
import { PaymentTransactionModel, SignatureType } from '../models'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { DescriptionList } from '@/features/common/components/description-list'
import { TransactionViewVisual } from './transaction-view-visual'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/features/common/components/tabs'
import { TransactionViewTable } from './transaction-view-table'
import { Multisig } from './multisig'
import { Logicsig } from './logicsig'

type PaymentTransactionProps = {
  transaction: PaymentTransactionModel
  rawTransaction: TransactionResult
}

const visualTransactionDetailsTabId = 'visual'
const tableTransactionDetailsTabId = 'table'
export const transactionDetailsLabel = 'View Transaction Details'
export const visualTransactionDetailsTabLabel = 'Visual'
export const tableTransactionDetailsTabLabel = 'Table'

export function PaymentTransaction({ transaction, rawTransaction }: PaymentTransactionProps) {
  const paymentTransactionItems = useMemo(
    () => [
      {
        dt: 'Sender',
        dd: (
          <a href="#" className={cn('text-primary underline')}>
            {transaction.sender}
          </a>
        ),
      },
      {
        dt: 'Receiver',
        dd: (
          <a href="#" className={cn('text-primary underline')}>
            {transaction.receiver}
          </a>
        ),
      },
      {
        dt: 'Amount',
        dd: <DisplayAlgo amount={transaction.amount} />,
      },
    ],
    [transaction.sender, transaction.receiver, transaction.amount]
  )

  return (
    <div className={cn('space-y-6 pt-7')}>
      <TransactionInfo transaction={transaction} />
      <Card className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-4')}>
          <div className={cn('space-y-2')}>
            <div className={cn('flex items-center justify-between')}>
              <h1 className={cn('text-2xl text-primary font-bold')}>Payment</h1>
            </div>
            <DescriptionList items={paymentTransactionItems} />
          </div>
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
          <TransactionNote transaction={transaction} />
          <TransactionJson transaction={rawTransaction} />
          {transaction.signature?.type === SignatureType.Multi && <Multisig signature={transaction.signature} />}
          {transaction.signature?.type === SignatureType.Logic && <Logicsig signature={transaction.signature} />}
        </CardContent>
      </Card>
    </div>
  )
}
