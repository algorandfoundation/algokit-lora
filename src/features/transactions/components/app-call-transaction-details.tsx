import { cn } from '@/features/common/utils'
import { Card, CardContent } from '@/features/common/components/card'
import { LogicsigDetails } from './logicsig-details'
import { MultisigDetails } from './multisig-details'
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
    <Card className={cn('px-4 pb-4 pt-2.5')}>
      <CardContent className={cn('text-sm space-y-4')}>
        <AppCallTransactionInfo transaction={transaction} />
        <TransactionViewTabs transaction={transaction} />
        {transaction.note && <TransactionNote note={transaction.note} />}
        {transaction.logs.length > 0 && <AppCallTransactionLogs logs={transaction.logs} />}
        {transaction.signature?.type === SignatureType.Multi && <MultisigDetails signature={transaction.signature} />}
        {transaction.signature?.type === SignatureType.Logic && <LogicsigDetails signature={transaction.signature} />}
      </CardContent>
    </Card>
  )
}
