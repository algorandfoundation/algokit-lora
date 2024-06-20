import { invariant } from '@/utils/invariant'
import { UrlParams } from '../../../routes/urls'
import { useRequiredParam } from '../../common/hooks/use-required-param'
import { TransactionDetails } from '../components/transaction-details'
import { useLoadableInnerTransactionAtom } from '../data'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { isValidInnerTransactionId } from '../utils/is-valid-inner-transaction-id'
import { isTransactionId } from '@/utils/is-transaction-id'
import { is404 } from '@/utils/error'
import { PageTitle } from '@/features/common/components/page-title'
import { PageLoader } from '@/features/common/components/page-loader'
import { useSplatParam } from '@/features/common/hooks/use-splat-param'

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

export function InnerTransactionPage() {
  const { transactionId } = useRequiredParam(UrlParams.TransactionId)
  invariant(isTransactionId(transactionId), transactionInvalidIdMessage)

  const innerTransactionId = useSplatParam() ?? ''
  invariant(isValidInnerTransactionId(innerTransactionId), `Invalid inner transaction id: ${innerTransactionId}`)

  const loadableTransaction = useLoadableInnerTransactionAtom(transactionId, innerTransactionId)

  return (
    <>
      <PageTitle title={transactionPageTitle} />
      <RenderLoadable loadable={loadableTransaction} transformError={transformError} fallback={<PageLoader />}>
        {(data) => <TransactionDetails transaction={data} />}
      </RenderLoadable>
    </>
  )
}
