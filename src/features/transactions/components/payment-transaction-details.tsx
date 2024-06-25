import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { TransactionNote } from './transaction-note'
import { SignatureType, PaymentTransaction, InnerPaymentTransaction } from '../models'
import { MultisigDetails } from './multisig-details'
import { LogicsigDetails } from './logicsig-details'
import { PaymentTransactionInfo } from './payment-transaction-info'
import { TransactionViewTabs } from './transaction-view-tabs'

type Props = {
  transaction: PaymentTransaction | InnerPaymentTransaction
}

export function PaymentTransactionDetails({ transaction }: Props) {
  return (
    <Card>
      <CardContent className={cn('space-y-4')}>
        <PaymentTransactionInfo transaction={transaction} />
        <TransactionViewTabs transaction={transaction} />
        {transaction.note && <TransactionNote note={transaction.note} />}
        {transaction.signature?.type === SignatureType.Multi && <MultisigDetails signature={transaction.signature} />}
        {transaction.signature?.type === SignatureType.Logic && <LogicsigDetails signature={transaction.signature} />}
      </CardContent>
    </Card>
  )
}
