import { TransactionId } from './types'
import { indexer } from '@/features/common/data'
import { lookupTransactionById } from '@algorandfoundation/algokit-utils'
import { atomsInAtom } from '@/features/common/data/atoms-in-atom'

const getTransactionResult = (transactionId: TransactionId) =>
  lookupTransactionById(transactionId, indexer).then((result) => {
    return result.transaction
  })

export const [transactionResultsAtom, getTransactionResultAtom] = atomsInAtom(getTransactionResult, (transactionId) => transactionId)

export const getTransactionResultAtoms = (transactionIds: TransactionId[]) => {
  return transactionIds.map((transactionId) => getTransactionResultAtom(transactionId))
}
