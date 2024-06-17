import { invariant } from '@/utils/invariant'
import { UrlParams } from '../../../routes/urls'
import { useRequiredParam } from '../../common/hooks/use-required-param'
import { TransactionDetails } from '../components/transaction-details'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { is404 } from '@/utils/error'
import { useLoadableTransactionAtom } from '../data'
import { isTransactionId } from '@/utils/is-transaction-id'
import { PageTitle } from '@/features/common/components/page-title'
import { PageLoader } from '@/features/common/components/page-loader'

const transformError = (e: Error) => {
  if (is404(e)) {
    return new Error(transactionNotFoundMessage)
  }

  // eslint-disable-next-line no-console
  console.error(e)
  return new Error(transactionFailedToLoadMessage)
}

export const transactionPageTitle = 'Transaction'
export const transactionNotFoundMessage = 'Transaction not found'
export const transactionInvalidIdMessage = 'Transaction Id is invalid'
export const transactionFailedToLoadMessage = 'Transaction failed to load'

export function TransactionPage() {
  const { transactionId } = useRequiredParam(UrlParams.TransactionId)
  invariant(isTransactionId(transactionId), transactionInvalidIdMessage)
  const loadableTransaction = useLoadableTransactionAtom(transactionId)

  return (
    <>
      <PageTitle title={transactionPageTitle} />
      <RenderLoadable loadable={loadableTransaction} transformError={transformError} fallback={<PageLoader />}>
        {(transaction) => <TransactionDetails transaction={transaction} />}
      </RenderLoadable>
    </>
  )
}
