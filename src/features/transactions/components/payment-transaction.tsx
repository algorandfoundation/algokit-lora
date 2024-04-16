import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { TransactionInfo } from './transaction-info'
import { TransactionNote } from './transaction-note'
import { TransactionJson } from './transaction-json'
import { SignatureType } from '../models'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { Multisig } from './multisig'
import { Logicsig } from './logicsig'
import { usePaymentTransaction } from '../data'
import { PaymentTransactionInfo } from './payment-transaction-info'
import { TransactionViewTabs } from './transaction-view-tabs'

type PaymentTransactionProps = {
  transactionResult: TransactionResult
}

export function PaymentTransaction({ transactionResult }: PaymentTransactionProps) {
  const paymentTransaction = usePaymentTransaction(transactionResult)

  return (
    <div className={cn('space-y-6 pt-7')}>
      <TransactionInfo transaction={paymentTransaction} />
      <Card className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-4')}>
          <PaymentTransactionInfo transaction={paymentTransaction} />
          <TransactionViewTabs transaction={paymentTransaction} />
          {paymentTransaction.note && <TransactionNote note={paymentTransaction.note} />}
          <TransactionJson transaction={transactionResult} />
          {paymentTransaction.signature?.type === SignatureType.Multi && <Multisig signature={paymentTransaction.signature} />}
          {paymentTransaction.signature?.type === SignatureType.Logic && <Logicsig signature={paymentTransaction.signature} />}
        </CardContent>
      </Card>
    </div>
  )
}
