import { atomsInAtom } from '@/features/common/data'
import { ApplicationMetadataResult, ApplicationResult } from './types'
import { flattenTransactionResult } from '@/features/transactions/utils/flatten-transaction-result'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { TransactionType } from 'algosdk'
import { base64ToUtf8 } from '@/utils/base64-to-utf8'
import { parseArc2 } from '@/features/transactions/mappers/arc-2'
import { parseJson } from '@/utils/parse-json'
import { indexer } from '@/features/common/data/algo-client'
import { atom } from 'jotai'

const getApplicationMetadataResult = atom(null, async (_get, _, applicationResult: ApplicationResult) => {
  // We only need to fetch the first page to find the application creation transaction
  const transactionResults = await indexer
    .searchForTransactions()
    .applicationID(applicationResult.id)
    .limit(3)
    .do()
    .then((res) => res.transactions as TransactionResult[])

  const creationTransaction = transactionResults
    .flatMap((txn) => flattenTransactionResult(txn))
    .find((txn) => txn['tx-type'] === TransactionType.appl && txn['created-application-index'] === applicationResult.id)
  if (!creationTransaction) return null

  const text = base64ToUtf8(creationTransaction.note ?? '')

  const maybeArc2 = parseArc2(text)

  let name = ''

  if (maybeArc2 && maybeArc2.format === 'j') {
    const arc2Data = parseJson(maybeArc2.data)
    if (arc2Data && 'name' in arc2Data) {
      name = arc2Data.name
    }
  }

  if (name) {
    return {
      name,
    } satisfies ApplicationMetadataResult
  } else {
    return null
  }
})

export const [applicationMetadataResultsAtom, getApplicationMetadataResultAtom] = atomsInAtom(
  getApplicationMetadataResult,
  (applicationResult) => applicationResult.id
)
