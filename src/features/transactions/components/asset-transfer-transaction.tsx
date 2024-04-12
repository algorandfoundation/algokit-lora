import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { TransactionInfo } from './transaction-info'
import { TransactionNote } from './transaction-note'
import { TransactionJson } from './transaction-json'
import { useMemo } from 'react'
import { SignatureType } from '../models'
import { AssetResult, TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { DescriptionList } from '@/features/common/components/description-list'
import { TransactionViewVisual } from './transaction-view-visual'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/features/common/components/tabs'
import { TransactionViewTable } from './transaction-view-table'
import { Multisig } from './multisig'
import { Logicsig } from './logicsig'
import { invariant } from '@/utils/invariant'
import algosdk from 'algosdk'

type AssetTransaferTransactionProps = {
  transaction: TransactionResult
}

const visualTransactionDetailsTabId = 'visual'
const tableTransactionDetailsTabId = 'table'
export const transactionDetailsLabel = 'View Transaction Details'
export const visualTransactionDetailsTabLabel = 'Visual'
export const tableTransactionDetailsTabLabel = 'Table'

export function AssetTranserTransaction({ transaction }: AssetTransaferTransactionProps) {
  invariant(transaction['tx-type'] === algosdk.TransactionType.axfer, 'The transaction must be an asset transfer transaction')

  const assetTransferTransactionItems = useMemo(
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
        dd: 'Foo',
      },
    ],
    [transaction.sender, transaction.receiver]
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
            <DescriptionList items={assetTransferTransactionItems} />
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
