import { TransactionId } from './types'
import { lookupTransactionById } from '@algorandfoundation/algokit-utils'
import { readOnlyAtomCache } from '@/features/common/data'
import { indexer } from '@/features/common/data/algo-client'
import { Getter, Setter } from 'jotai/index'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'

const getTransactionResult = (_: Getter, __: Setter, transactionId: TransactionId) =>
  lookupTransactionById(transactionId, indexer).then((result) => {
    return result.transaction
  })

const keySelector = (transactionId: TransactionId) => transactionId

export const [transactionResultsAtom, getTransactionResultAtom] = readOnlyAtomCache<
  Parameters<typeof keySelector>,
  ReturnType<typeof keySelector>,
  Promise<TransactionResult> | TransactionResult
>(getTransactionResult, keySelector)

export const getTransactionResultAtoms = (transactionIds: TransactionId[]) => {
  return transactionIds.map((transactionId) => getTransactionResultAtom(transactionId))
}
