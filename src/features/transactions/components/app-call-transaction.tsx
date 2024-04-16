import { cn } from '@/features/common/utils'
import { TransactionInfo } from './transaction-info'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { useLoadableAppCallTransction } from '../data'
import { RenderLoadable } from '@/features/common/components/render-loadable'

type ApplicationCallTransaction = {
  transactionResult: TransactionResult
}

export function AppCallTransaction({ transactionResult }: ApplicationCallTransaction) {
  const loadableAppCallTransction = useLoadableAppCallTransction(transactionResult)

  return (
    <RenderLoadable loadable={loadableAppCallTransction}>
      {(appCallTransaction) => (
        <div className={cn('space-y-6 pt-7')}>
          <TransactionInfo transaction={appCallTransaction} />
          {/* <Card className={cn('p-4')}>
            <CardContent className={cn('text-sm space-y-4')}>
              <AssetTransferTransactionInfo transaction={appCallTransaction} />
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
                  <TransactionViewVisual transaction={appCallTransaction} />
                </TabsContent>
                <TabsContent value={tableTransactionDetailsTabId} className={cn('border-solid border-2 border-border p-4')}>
                  <TransactionViewTable transaction={appCallTransaction} />
                </TabsContent>
              </Tabs>
              {appCallTransaction.note && <TransactionNote note={appCallTransaction.note} />}
              <TransactionJson transaction={transactionResult} />
              {appCallTransaction.signature?.type === SignatureType.Multi && <Multisig signature={appCallTransaction.signature} />}
              {appCallTransaction.signature?.type === SignatureType.Logic && <Logicsig signature={appCallTransaction.signature} />}
            </CardContent>
          </Card>*/}
        </div>
      )}
    </RenderLoadable>
  )
}
