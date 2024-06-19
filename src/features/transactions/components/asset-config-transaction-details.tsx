import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { TransactionNote } from './transaction-note'
import { SignatureType, AssetConfigTransaction, InnerAssetConfigTransaction } from '../models'
import { MultisigDetails } from './multisig-details'
import { LogicsigDetails } from './logicsig-details'
import { TransactionViewTabs } from './transaction-view-tabs'
import { AssetConfigTransactionInfo } from './asset-config-transaction-info'

type Props = {
  transaction: AssetConfigTransaction | InnerAssetConfigTransaction
}

export function AssetConfigTransactionDetails({ transaction }: Props) {
  return (
    <Card className={cn('px-4 pb-4 pt-2')}>
      <CardContent className={cn('text-sm space-y-4')}>
        <AssetConfigTransactionInfo transaction={transaction} />
        <TransactionViewTabs transaction={transaction} />
        {transaction.note && <TransactionNote note={transaction.note} />}
        {transaction.signature?.type === SignatureType.Multi && <MultisigDetails signature={transaction.signature} />}
        {transaction.signature?.type === SignatureType.Logic && <LogicsigDetails signature={transaction.signature} />}
      </CardContent>
    </Card>
  )
}
