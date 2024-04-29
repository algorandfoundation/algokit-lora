import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { TransactionInfo } from './transaction-info'
import { TransactionNote } from './transaction-note'
import { TransactionJson } from './transaction-json'
import { KeyRegTransaction, InnerKeyRegTransaction, SignatureType } from '../models'
import { MultisigDetails } from './multisig-details'
import { LogicsigDetails } from './logicsig-details'
import { KeyRegTransactionInfo } from './key-reg-transaction-info'
import { TransactionVisualTabs } from './transaction-visual-tabs'

type KeyRegTransactionProps = {
  transaction: KeyRegTransaction | InnerKeyRegTransaction
}

export function KeyRegTransactionDetails({ transaction }: KeyRegTransactionProps) {
  return (
    <div className={cn('space-y-6 pt-7')}>
      <TransactionInfo transaction={transaction} />
      <Card className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-4')}>
          <KeyRegTransactionInfo transaction={transaction} />
          <TransactionVisualTabs transaction={transaction} />
          {transaction.note && <TransactionNote note={transaction.note} />}
          <TransactionJson json={transaction.json} />
          {transaction.signature?.type === SignatureType.Multi && <MultisigDetails signature={transaction.signature} />}
          {transaction.signature?.type === SignatureType.Logic && <LogicsigDetails signature={transaction.signature} />}
        </CardContent>
      </Card>
    </div>
  )
}
