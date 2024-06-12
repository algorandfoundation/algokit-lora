import { cn } from '@/features/common/utils'
import { TransactionInfo } from './transaction-info'
import { Card, CardContent } from '@/features/common/components/card'
import { LogicsigDetails } from './logicsig-details'
import { MultisigDetails } from './multisig-details'
import { TransactionJson } from './transaction-json'
import { TransactionNote } from './transaction-note'
import { AppCallTransaction, InnerAppCallTransaction, SignatureType } from '../models'
import { TransactionViewTabs } from './transaction-view-tabs'
import { AppCallTransactionInfo } from './app-call-transaction-info'
import { AppCallTransactionLogs } from './app-call-transaction-logs'

type Props = {
  transaction: AppCallTransaction | InnerAppCallTransaction
}

export function AppCallTransactionDetails({ transaction }: Props) {
  return (
    <div className={cn('space-y-4')}>
      <TransactionInfo transaction={transaction} />
      <Card className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-4')}>
          <AppCallTransactionInfo transaction={transaction} />
          <TransactionViewTabs transaction={transaction} />
          {transaction.note && <TransactionNote note={transaction.note} />}
          {transaction.logs.length > 0 && <AppCallTransactionLogs logs={transaction.logs} />}
          <TransactionJson json={transaction.json} />
          {transaction.signature?.type === SignatureType.Multi && <MultisigDetails signature={transaction.signature} />}
          {transaction.signature?.type === SignatureType.Logic && <LogicsigDetails signature={transaction.signature} />}
        </CardContent>
      </Card>
    </div>
  )
}
