import { ApplicationResult } from '@/features/accounts/data/types'
import { atomsInAtom } from '@/features/common/data/atoms-in-atom'
import { atom } from 'jotai'
import { ApplicationMetadataResult } from './types'
import { indexer } from '@/features/common/data'
import { flattenTransactionResult } from '@/features/transactions/utils/flatten-transaction-result'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { TransactionType } from 'algosdk'
import { base64ToUtf8 } from '@/utils/base64-to-utf8'
import { parseArc2 } from '@/features/transactions/mappers/arc-2'
import { parseJson } from '@/utils/parse-json'

const createApplicationMetadataResultAtom = (applicationResult: ApplicationResult) => {
  return atom<Promise<ApplicationMetadataResult> | ApplicationMetadataResult>(async (_get) => {
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
    if (maybeArc2 && maybeArc2.format === 'j') {
      const arc2Data = parseJson(maybeArc2.data)
      if (arc2Data && 'name' in arc2Data) {
        return { name: arc2Data.name }
      }
    }

    return null
  })
}

export const [applicationMetadataResultsAtom, getApplicationMetadataResultAtom] = atomsInAtom(
  createApplicationMetadataResultAtom,
  (applicationResult) => applicationResult.id
)
