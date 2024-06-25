import { Card, CardContent } from '@/features/common/components/card'
import { SignatureType, StateProofTransaction } from '../models'
import { cn } from '@/features/common/utils'
import { LogicsigDetails } from './logicsig-details'
import { MultisigDetails } from './multisig-details'
import { TransactionNote } from './transaction-note'
import { TransactionViewTabs } from './transaction-view-tabs'

type Props = {
  transaction: StateProofTransaction
}

export function StateProofTransactionDetails({ transaction }: Props) {
  return (
    <Card>
      <CardContent className={cn('space-y-4')}>
        <div className={cn('flex items-center justify-between')}>
          <h2>State Proof</h2>
        </div>
        <TransactionViewTabs transaction={transaction} />
        {transaction.note && <TransactionNote note={transaction.note} />}
        {transaction.signature?.type === SignatureType.Multi && <MultisigDetails signature={transaction.signature} />}
        {transaction.signature?.type === SignatureType.Logic && <LogicsigDetails signature={transaction.signature} />}
      </CardContent>
    </Card>
  )
}
