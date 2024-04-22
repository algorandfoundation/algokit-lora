import { invariant } from '@/utils/invariant'
import { UrlParams } from '../../../routes/urls'
import { useRequiredParam } from '../../common/hooks/use-required-param'
import { Transaction } from '../components/transaction'
import { useLoadableTransactionModelAtom } from '../data'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { cn } from '@/features/common/utils'
import { is404 } from '@/utils/error'

const isValidTransactionId = (transactionId: string) => transactionId.length === 52

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
  invariant(isValidTransactionId(transactionId), transactionInvalidIdMessage)
  const loadableTransaction = useLoadableTransactionModelAtom(transactionId)

  return (
    <div>
      <h1 className={cn('text-2xl text-primary font-bold')}>{transactionPageTitle}</h1>
      <RenderLoadable loadable={loadableTransaction} transformError={transformError}>
        {(transaction) => <Transaction transaction={transaction} />}
      </RenderLoadable>
    </div>
  )
}
