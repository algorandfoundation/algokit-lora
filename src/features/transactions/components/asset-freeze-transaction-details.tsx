import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { TransactionNote } from './transaction-note'
import { AssetFreezeTransaction, InnerAssetFreezeTransaction, SignatureType } from '../models'
import { MultisigDetails } from './multisig-details'
import { LogicsigDetails } from './logicsig-details'
import { AssetFreezeTransactionInfo } from './asset-freeze-transaction-info'
import { TransactionViewTabs } from './transaction-view-tabs'

type AssetFreezeTransactionProps = {
  transaction: AssetFreezeTransaction | InnerAssetFreezeTransaction
}

export function AssetFreezeTransactionDetails({ transaction }: AssetFreezeTransactionProps) {
  return (
    <Card>
      <CardContent className={cn('space-y-4')}>
        <AssetFreezeTransactionInfo transaction={transaction} />
        <TransactionViewTabs transaction={transaction} />
        {transaction.note && <TransactionNote note={transaction.note} />}
        {transaction.signature?.type === SignatureType.Multi && <MultisigDetails signature={transaction.signature} />}
        {transaction.signature?.type === SignatureType.Logic && <LogicsigDetails signature={transaction.signature} />}
      </CardContent>
    </Card>
  )
}
