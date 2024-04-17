import { invariant } from '@/utils/invariant'
import { ApplicationTransactionResult, TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'

type SupportedType = Pick<ApplicationTransactionResult, 'foreign-assets' | 'foreign-apps' | 'accounts'>

export const getRecursiveDataForAppCallTransaction = <TKey extends keyof SupportedType>(
  transaction: TransactionResult,
  key: TKey
): NonNullable<SupportedType[TKey]> => {
  // Make sure that it is an application call transaction
  invariant(transaction['application-transaction'], 'application-transaction is not set')
  const results: NonNullable<SupportedType[TKey]> = transaction['application-transaction'][key] ?? []

  transaction['inner-txns']?.flatMap((innerTxn) => {
    if (innerTxn['asset-transfer-transaction']) {
      // I don't know why we had to cast this to never[]
      results.push(...(getRecursiveDataForAppCallTransaction(innerTxn, key) as never[]))
    }
  })

  return results
}
