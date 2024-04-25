import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { TransactionInfo } from './transaction-info'
import { TransactionNote } from './transaction-note'
import { TransactionJson } from './transaction-json'
import { SignatureType, PaymentTransaction, InnerPaymentTransaction } from '../models'
import { MultisigDetails } from './multisig-details'
import { LogicsigDetails } from './logicsig-details'
import { PaymentTransactionInfo } from './payment-transaction-info'
import { TransactionVisualTabs } from './transaction-visual-tabs'

type PaymentTransactionProps = {
  transaction: PaymentTransaction | InnerPaymentTransaction
}

export function PaymentTransactionDetails({ transaction }: PaymentTransactionProps) {
  return (
    <div className={cn('space-y-6 pt-7')}>
      <TransactionInfo transaction={transaction} />
      <Card className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-4')}>
          <PaymentTransactionInfo transaction={transaction} />
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
