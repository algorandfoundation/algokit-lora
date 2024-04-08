import { UrlParams } from '../../../routes/urls'
import { useRequiredParam } from '../../common/hooks/use-required-param'
import { Transaction } from '../components/transaction'
import { getSampleTransaction } from './get-sample-transaction'

export const isValidTransactionId = (transactionId: string) => transactionId.length === 52

export function TransactionPage() {
  const { transactionId } = useRequiredParam(UrlParams.TransactionId)
  if (!isValidTransactionId(transactionId)) {
    return <div>Transaction does not exist</div>
  }
  const sampleTransaction = getSampleTransaction(transactionId)

  return <Transaction transaction={sampleTransaction} />
}
