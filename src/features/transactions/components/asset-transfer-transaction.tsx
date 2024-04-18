import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { TransactionInfo } from './transaction-info'
import { TransactionNote } from './transaction-note'
import { TransactionJson } from './transaction-json'
import { AssetTransferTransactionModel, SignatureType } from '../models'
import { TransactionViewVisual } from './transaction-view-visual'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/features/common/components/tabs'
import { TransactionViewTable } from './transaction-view-table'
import { Multisig } from './multisig'
import { Logicsig } from './logicsig'
import { AssetTransferTransactionInfo } from './asset-transfer-transaction-info'

type AssetTransaferTransactionProps = {
  transaction: AssetTransferTransactionModel
}

const visualTransactionDetailsTabId = 'visual'
const tableTransactionDetailsTabId = 'table'
export const transactionDetailsLabel = 'View Transaction Details'
export const visualTransactionDetailsTabLabel = 'Visual'
export const tableTransactionDetailsTabLabel = 'Table'

export function AssetTranserTransaction({ transaction }: AssetTransaferTransactionProps) {
  return (
    <div className={cn('space-y-6 pt-7')}>
      <TransactionInfo transaction={transaction} />
      <Card className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-4')}>
          <AssetTransferTransactionInfo transaction={transaction} />
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
