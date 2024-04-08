import invariant from 'tiny-invariant'
import { UrlParams } from '../../../routes/urls'
import { useRequiredParam } from '../../common/hooks/use-required-param'
import { Transaction } from '../components/transaction'
import { useLoadableTransaction } from '../data'
import { transactionPageConstants } from '@/features/theme/constant'

export const isValidTransactionId = (transactionId: string) => transactionId.length === 52

export function TransactionPage() {
  const { transactionId } = useRequiredParam(UrlParams.TransactionId)
  invariant(isValidTransactionId(transactionId), 'transactionId is invalid')
  const loadableTransaction = useLoadableTransaction(transactionId)

  if (loadableTransaction.state === 'hasData') {
    return <Transaction transaction={loadableTransaction.data} />
  } else if (loadableTransaction.state === 'loading') {
    // TODO: Make this a spinner
    return <p>Loading....</p>
  }

  if (
    loadableTransaction.error &&
    typeof loadableTransaction.error === 'object' &&
    'status' in loadableTransaction.error &&
    loadableTransaction.error.status === 404
  ) {
    return <p>{transactionPageConstants.transactionNotFound}</p>
  }

  return <p>{transactionPageConstants.genericError}</p>
}
