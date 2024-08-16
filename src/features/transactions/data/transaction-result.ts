import { TransactionId } from './types'
import { lookupTransactionById } from '@algorandfoundation/algokit-utils'
import { readOnlyAtomCache } from '@/features/common/data'
import { indexer } from '@/features/common/data/algo-client'
import { Getter, Setter } from 'jotai/index'

const getTransactionResult = (_: Getter, __: Setter, transactionId: TransactionId) =>
  lookupTransactionById(transactionId, indexer).then((result) => {
    return result.transaction
  })

export const [transactionResultsAtom, getTransactionResultAtom] = readOnlyAtomCache(getTransactionResult, (transactionId) => transactionId)

export const getTransactionResultAtoms = (transactionIds: TransactionId[]) => {
  return transactionIds.map((transactionId) => getTransactionResultAtom(transactionId))
}
