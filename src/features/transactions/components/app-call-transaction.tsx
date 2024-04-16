import { cn } from '@/features/common/utils'
import { TransactionInfo } from './transaction-info'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { useAppCallTransction } from '../data'

type ApplicationCallTransaction = {
  transactionResult: TransactionResult
}

export function AppCallTransaction({ transactionResult }: ApplicationCallTransaction) {
  const appCallTransaction = useAppCallTransction(transactionResult)

  return (
    <div className={cn('space-y-6 pt-7')}>
      <TransactionInfo transaction={appCallTransaction} />
    </div>
  )
}
