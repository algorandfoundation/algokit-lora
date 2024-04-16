import { cn } from '@/features/common/utils'
import { TransactionInfo } from './transaction-info'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { useLoadableAppCallTransction } from '../data'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { Card, CardContent } from '@/features/common/components/card'
import { Logicsig } from './logicsig'
import { Multisig } from './multisig'
import { TransactionJson } from './transaction-json'
import { TransactionNote } from './transaction-note'
import { SignatureType } from '../models'
import { TransactionViewTabs } from './transaction-view-tabs'

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
          <Card className={cn('p-4')}>
            <CardContent className={cn('text-sm space-y-4')}>
              <TransactionViewTabs transaction={appCallTransaction} />
              {appCallTransaction.note && <TransactionNote note={appCallTransaction.note} />}
              <TransactionJson transaction={transactionResult} />
              {appCallTransaction.signature?.type === SignatureType.Multi && <Multisig signature={appCallTransaction.signature} />}
              {appCallTransaction.signature?.type === SignatureType.Logic && <Logicsig signature={appCallTransaction.signature} />}
            </CardContent>
          </Card>
        </div>
      )}
    </RenderLoadable>
  )
}
