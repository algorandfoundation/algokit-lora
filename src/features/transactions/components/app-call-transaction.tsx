import { cn } from '@/features/common/utils'
import { TransactionInfo } from './transaction-info'
import { Card, CardContent } from '@/features/common/components/card'
import { Logicsig } from './logicsig'
import { Multisig } from './multisig'
import { TransactionJson } from './transaction-json'
import { TransactionNote } from './transaction-note'
import { AppCallTransactionModel, SignatureType } from '../models'
import { TransactionViewTabs } from './transaction-view-tabs'
import { AppCallTransactionInfo } from './app-call-transaction-info'
import { AppCallTransactionLogs } from './all-calltransaction-log'

type Props = {
  transaction: AppCallTransactionModel
}

export function AppCallTransaction({ transaction }: Props) {
  return (
    <div className={cn('space-y-6 pt-7')}>
      <TransactionInfo transaction={transaction} />
      <Card className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-4')}>
          <AppCallTransactionInfo transaction={transaction} />
          <TransactionViewTabs transaction={transaction} />
          {transaction.note && <TransactionNote note={transaction.note} />}
          {transaction.logs.length > 0 && <AppCallTransactionLogs logs={transaction.logs} />}
          <TransactionJson json={transaction.json} />
          {transaction.signature?.type === SignatureType.Multi && <Multisig signature={transaction.signature} />}
          {transaction.signature?.type === SignatureType.Logic && <Logicsig signature={transaction.signature} />}
        </CardContent>
      </Card>
    </div>
  )
}
