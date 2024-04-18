import { invariant } from '@/utils/invariant'
import { ApplicationTransactionResult, TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'

type SupportedType = Pick<ApplicationTransactionResult, 'foreign-assets' | 'foreign-apps' | 'accounts'>

export const getRecursiveDataForAppCallTransaction = <TKey extends keyof SupportedType>(
  transaction: TransactionResult,
  key: TKey
): NonNullable<SupportedType[TKey]> => {
  // Make sure that it is an application call transaction
  invariant(transaction['application-transaction'], 'application-transaction is not set')

  const innerTransactions = transaction['inner-txns'] ?? []
  return innerTransactions.reduce(
    (acc, innerTxn) => {
      if (innerTxn['application-transaction']) {
        const innerResult = getRecursiveDataForAppCallTransaction<TKey>(innerTxn, key)
        return acc.concat(innerResult) as NonNullable<SupportedType[TKey]>
      }
      return acc
    },
    transaction['application-transaction'][key] ?? ([] as NonNullable<SupportedType[TKey]>)
  )
}
