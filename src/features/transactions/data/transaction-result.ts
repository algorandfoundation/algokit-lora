import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { TransactionId } from './types'
import { indexer } from '@/features/common/data'
import { lookupTransactionById } from '@algorandfoundation/algokit-utils'
import { atom } from 'jotai'
import { atomsInAtom } from '@/features/common/data/atoms-in-atom'
import { JotaiStore } from '@/features/common/data/types'

const createTransactionResultAtom = (transactionId: TransactionId) =>
  atom<Promise<TransactionResult> | TransactionResult>(async (_get) => {
    return lookupTransactionById(transactionId, indexer).then((result) => {
      return result.transaction
    })
  })

export const [transactionResultsAtom, getTransactionResultAtom] = atomsInAtom(createTransactionResultAtom, (transactionId) => transactionId)

export const getTransactionResultAtoms = (store: JotaiStore, transactionIds: TransactionId[]) => {
  return transactionIds.map((transactionId) => getTransactionResultAtom(store, transactionId))
}
