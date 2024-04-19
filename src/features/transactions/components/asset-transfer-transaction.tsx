import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { TransactionInfo } from './transaction-info'
import { TransactionNote } from './transaction-note'
import { TransactionJson } from './transaction-json'
import { AssetTransferTransactionModel, InnerAssetTransferTransactionModel, SignatureType } from '../models'
import { Multisig } from './multisig'
import { Logicsig } from './logicsig'
import { AssetTransferTransactionInfo } from './asset-transfer-transaction-info'
import { TransactionViewTabs } from './transaction-view-tabs'

type AssetTransaferTransactionProps = {
  transaction: AssetTransferTransactionModel | InnerAssetTransferTransactionModel
}

export function AssetTranserTransaction({ transaction }: AssetTransaferTransactionProps) {
  return (
    <div className={cn('space-y-6 pt-7')}>
      <TransactionInfo transaction={transaction} />
      <Card className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-4')}>
          <AssetTransferTransactionInfo transaction={transaction} />
          <TransactionViewTabs transaction={transaction} />
          {transaction.note && <TransactionNote note={transaction.note} />}
          <TransactionJson json={transaction.json} />
          {transaction.signature?.type === SignatureType.Multi && <Multisig signature={transaction.signature} />}
          {transaction.signature?.type === SignatureType.Logic && <Logicsig signature={transaction.signature} />}
        </CardContent>
      </Card>
    </div>
  )
}
