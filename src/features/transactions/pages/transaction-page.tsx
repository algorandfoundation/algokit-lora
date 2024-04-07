import { UrlParams } from '../../../routes/urls'
import { useRequiredParam } from '../../common/hooks/use-required-param'
import { Transaction } from '../components/transaction'
import { useLoadableTransaction } from '../data'

export function TransactionPage() {
  const { transactionId } = useRequiredParam(UrlParams.TransactionId)
  const loadableTransaction = useLoadableTransaction(transactionId)

  if (loadableTransaction.state === 'hasData') {
    return <Transaction transaction={loadableTransaction.data} />
  } else if (loadableTransaction.state === 'loading') {
    return <p>Loading....</p>
  }

  if (
    loadableTransaction.error &&
    typeof loadableTransaction.error === 'object' &&
    'status' in loadableTransaction.error &&
    loadableTransaction.error.status === 404
  ) {
    return <p>Error: Transaction not found</p>
  }

  return <p>Error: Transaction failed to load</p>
}
