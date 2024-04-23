import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { TransactionInfo } from './transaction-info'
import { TransactionNote } from './transaction-note'
import { TransactionJson } from './transaction-json'
import { SignatureType, AssetConfigTransactionModel, InnerAssetConfigTransactionModel } from '../models'
import { Multisig } from './multisig'
import { Logicsig } from './logicsig'
import { TransactionViewTabs } from './transaction-view-tabs'
import { AssetConfigTransactionInfo } from './asset-config-transaction-info'

type Props = {
  transaction: AssetConfigTransactionModel | InnerAssetConfigTransactionModel
}

export function AssetConfigTransaction({ transaction }: Props) {
  return (
    <div className={cn('space-y-6 pt-7')}>
      <TransactionInfo transaction={transaction} />
      <Card className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-4')}>
          <AssetConfigTransactionInfo transaction={transaction} />
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
