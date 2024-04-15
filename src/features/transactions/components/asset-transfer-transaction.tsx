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
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { useLoadableAssetTransferTransaction } from '../data'
import { AssetTransferTransactionInfo } from './asset-transfer-transaction-info'

type AssetTransaferTransactionProps = {
  transactionResult: TransactionResult
}

const visualTransactionDetailsTabId = 'visual'
const tableTransactionDetailsTabId = 'table'
export const transactionDetailsLabel = 'View Transaction Details'
export const visualTransactionDetailsTabLabel = 'Visual'
export const tableTransactionDetailsTabLabel = 'Table'

export function AssetTranserTransaction({ transactionResult }: AssetTransaferTransactionProps) {
  const loadableAssetTransferTransction = useLoadableAssetTransferTransaction(transactionResult)

  return (
    <RenderLoadable loadable={loadableAssetTransferTransction}>
      {(assetTransferTransaction) => (
        <div className={cn('space-y-6 pt-7')}>
          <TransactionInfo transaction={assetTransferTransaction} />
          <Card className={cn('p-4')}>
            <CardContent className={cn('text-sm space-y-4')}>
              <AssetTransferTransactionInfo transaction={assetTransferTransaction} />
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
                  <TransactionViewVisual transaction={assetTransferTransaction} />
                </TabsContent>
                <TabsContent value={tableTransactionDetailsTabId} className={cn('border-solid border-2 border-border p-4')}>
                  <TransactionViewTable transaction={assetTransferTransaction} />
                </TabsContent>
              </Tabs>
              {assetTransferTransaction.note && <TransactionNote note={assetTransferTransaction.note} />}
              <TransactionJson transaction={transactionResult} />
              {assetTransferTransaction.signature?.type === SignatureType.Multi && (
                <Multisig signature={assetTransferTransaction.signature} />
              )}
              {assetTransferTransaction.signature?.type === SignatureType.Logic && (
                <Logicsig signature={assetTransferTransaction.signature} />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </RenderLoadable>
  )
}
