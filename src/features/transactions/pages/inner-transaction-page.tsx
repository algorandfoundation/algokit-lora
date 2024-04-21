import { invariant } from '@/utils/invariant'
import { UrlParams } from '../../../routes/urls'
import { useRequiredParam } from '../../common/hooks/use-required-param'
import { Transaction } from '../components/transaction'
import { useLoadableInnerTransactionModelAtom } from '../data'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { cn } from '@/features/common/utils'
import { isValidInnerTransactionId } from '../utils/is-valid-inner-transaction-id'

const isValidTransactionId = (transactionId: string) => transactionId.length === 52

const transformError = (e: Error) => {
  if ('status' in e && e.status === 404) {
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
  invariant(isValidTransactionId(transactionId), transactionInvalidIdMessage)

  const { innerTransactionId } = useRequiredParam(UrlParams.InnerTransactionId)
  invariant(isValidInnerTransactionId(innerTransactionId), `Invalid inner transaction id: ${innerTransactionId}`)

  const loadableTransaction = useLoadableInnerTransactionModelAtom(transactionId, innerTransactionId)

  return (
    <RenderLoadable loadable={loadableTransaction} transformError={transformError}>
      {(data) => (
        <div>
          <h1 className={cn('text-2xl text-primary font-bold')}>{transactionPageTitle}</h1>
          <Transaction transaction={data} />
        </div>
      )}
    </RenderLoadable>
  )
}
