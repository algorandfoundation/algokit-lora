import { UrlParams } from '../../../routes/urls'
import { useRequiredParam } from '../../common/hooks/use-required-param'
import { Transaction } from '../components/transaction'
import { getSampleTransaction } from './get-sample-transaction'

export function TransactionPage() {
  const { transactionId } = useRequiredParam(UrlParams.TransactionId)
  const sampleTransaction = getSampleTransaction(transactionId)

  return <Transaction transaction={sampleTransaction} />
}
