import { readOnlyAtomCache } from '@/features/common/data'
import { ApplicationMetadataResult, ApplicationResult } from './types'
import { flattenTransactionResult } from '@/features/transactions/utils/flatten-transaction-result'
import { TransactionType } from 'algosdk'
import { parseArc2 } from '@/features/transactions/mappers'
import { parseJson } from '@/utils/parse-json'
import { indexer } from '@/features/common/data/algo-client'
import { Getter, Setter } from 'jotai/index'
import { uint8ArrayToUtf8 } from '@/utils/uint8-array-to-utf8'
import { indexerTransactionToTransactionResult } from '@/features/transactions/mappers/indexer-transaction-mappers'

const getApplicationMetadataResult = async (
  _: Getter,
  __: Setter,
  applicationResult: ApplicationResult
): Promise<ApplicationMetadataResult> => {
  // We only need to fetch the first page to find the application creation transaction
  const response = await indexer.searchForTransactions({
    applicationId: applicationResult.id,
    limit: 3,
  })
  const transactionResults = response.transactions.map((txn) => indexerTransactionToTransactionResult(txn))

  const creationTransaction = transactionResults
    .flatMap((txn) => flattenTransactionResult(txn))
    .find((txn) => txn.txType === TransactionType.appl && txn.createdApplicationIndex === applicationResult.id)
  if (!creationTransaction) return null

  const text = uint8ArrayToUtf8(creationTransaction.note ?? new Uint8Array())

  const maybeArc2 = parseArc2(text)
  if (maybeArc2 && maybeArc2.format === 'j') {
    const arc2Data = parseJson(maybeArc2.data)
    if (arc2Data && 'name' in arc2Data) {
      return { name: arc2Data.name }
    }
  }

  return null
}

export const [applicationMetadataResultsAtom, getApplicationMetadataResultAtom] = readOnlyAtomCache(
  getApplicationMetadataResult,
  (applicationResult) => applicationResult.id
)
