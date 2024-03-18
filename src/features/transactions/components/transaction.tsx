import { cn } from '@/features/common/utils'
import { PaymentTransactionModel, TransactionType } from '../models/models'
import { PaymentTransaction } from './payment-transaction'

type Props = {
  transaction: PaymentTransactionModel
}

export function Transaction({ transaction }: Props) {
  return (
    <div>
      <h1 className={cn('text-2xl text-primary font-bold')}>Transaction</h1>
      {transaction.type === TransactionType.Payment && <PaymentTransaction transaction={transaction} />}
    </div>
  )
}
