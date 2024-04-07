import { cn } from '@/features/common/utils'
import { PaymentTransaction } from './payment-transaction'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { TransactionType } from 'algosdk'

type Props = {
  transaction: TransactionResult
}

export function Transaction({ transaction }: Props) {
  return (
    <div>
      <h1 className={cn('text-2xl text-primary font-bold')}>Transaction</h1>
      {transaction['tx-type'] === TransactionType.pay && <PaymentTransaction transaction={transaction} />}
    </div>
  )
}
