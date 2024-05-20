import { ApplicationResult } from '@/features/accounts/data/types'
import { atomsInAtom } from '@/features/common/data/atoms-in-atom'
import { atom } from 'jotai'
import { ApplicationMetadataResult } from './types'
import { indexer } from '@/features/common/data'
import { flattenTransactionResult } from '@/features/transactions/utils/flatten-transaction-result'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { TransactionType } from 'algosdk'
import { base64ToUtf8 } from '@/utils/base64-to-utf8'

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
    console.log(text)
    const maybeJson = parseJson(text)
    if (maybeJson && 'name' in maybeJson) {
      return { name: maybeJson.name }
    }

    return null
  })
}

export const [applicationMetadataResultsAtom, getApplicationMetadataResultAtom] = atomsInAtom(
  createApplicationMetadataResultAtom,
  (applicationResult) => applicationResult.id
)

// TODO: refactor
function parseJson(maybeJson: string) {
  try {
    const json = JSON.parse(maybeJson)
    if (json && typeof json === 'object') {
      return json
    }
  } catch (e) {
    // ignore
  }
}
