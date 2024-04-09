import { invariant } from '@/utils/invariant'
import { UrlParams } from '../../../routes/urls'
import { useRequiredParam } from '../../common/hooks/use-required-param'
import { Transaction } from '../components/transaction'
import { useLoadableTransaction } from '../data'
import { transactionPageConstants } from '@/features/theme/constant'
import { RenderLoadable } from '@/features/common/components/render-loadable'

const isValidTransactionId = (transactionId: string) => transactionId.length === 52

const transformError = (e: Error) => {
  if ('status' in e && e.status === 404) {
    return new Error(transactionPageConstants.notFoundMessage)
  }

  // eslint-disable-next-line no-console
  console.error(e)
  return new Error(transactionPageConstants.failedToLoadMessage)
}

export function TransactionPage() {
  const { transactionId } = useRequiredParam(UrlParams.TransactionId)
  invariant(isValidTransactionId(transactionId), transactionPageConstants.invalidIdMessage)
  const loadableTransaction = useLoadableTransaction(transactionId)

  return (
    <RenderLoadable loadable={loadableTransaction} transformError={transformError}>
      {(data) => <Transaction transaction={data} />}
    </RenderLoadable>
  )
}
