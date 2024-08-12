import { TransactionId } from './types'
import { lookupTransactionById } from '@algorandfoundation/algokit-utils'
import { atomsInAtomV4 } from '@/features/common/data'
import { indexer } from '@/features/common/data/algo-client'
import { atom } from 'jotai'

const getTransactionResult = (transactionId: TransactionId) =>
  lookupTransactionById(transactionId, indexer).then((result) => {
    return result.transaction
  })

const transactionResultAtomBuilder = (transactionId: TransactionId) => {
  return atom(async () => {
    return await getTransactionResult(transactionId)
  })
}

export const [transactionResultsAtom, getTransactionResultAtom] = atomsInAtomV4(
  transactionResultAtomBuilder,
  (transactionId) => transactionId
)

export const getTransactionResultAtoms = (transactionIds: TransactionId[]) => {
  return transactionIds.map((transactionId) => getTransactionResultAtom(transactionId))
}
