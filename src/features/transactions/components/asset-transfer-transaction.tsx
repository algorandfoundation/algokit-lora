import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { TransactionInfo } from './transaction-info'
import { TransactionNote } from './transaction-note'
import { TransactionJson } from './transaction-json'
import { SignatureType } from '../models'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { Multisig } from './multisig'
import { Logicsig } from './logicsig'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { useLoadableAssetTransferTransaction } from '../data'
import { AssetTransferTransactionInfo } from './asset-transfer-transaction-info'
import { TransactionViewTabs } from './transaction-view-tabs'

type AssetTransaferTransactionProps = {
  transactionResult: TransactionResult
}

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
              <TransactionViewTabs transaction={assetTransferTransaction} />
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
