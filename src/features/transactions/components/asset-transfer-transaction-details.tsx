import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { TransactionNote } from './transaction-note'
import { AssetTransferTransaction, InnerAssetTransferTransaction, SignatureType } from '../models'
import { MultisigDetails } from './multisig-details'
import { LogicsigDetails } from './logicsig-details'
import { AssetTransferTransactionInfo } from './asset-transfer-transaction-info'
import { TransactionViewTabs } from './transaction-view-tabs'

type Props = {
  transaction: AssetTransferTransaction | InnerAssetTransferTransaction
}

export function AssetTransferTransactionDetails({ transaction }: Props) {
  return (
    <Card>
      <CardContent className={cn('space-y-4')}>
        <AssetTransferTransactionInfo transaction={transaction} />
        <TransactionViewTabs transaction={transaction} />
        {transaction.note && <TransactionNote note={transaction.note} />}
        {transaction.signature?.type === SignatureType.Multi && <MultisigDetails signature={transaction.signature} />}
        {transaction.signature?.type === SignatureType.Logic && <LogicsigDetails signature={transaction.signature} />}
      </CardContent>
    </Card>
  )
}
