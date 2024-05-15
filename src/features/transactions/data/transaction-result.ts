import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { TransactionId } from './types'
import { indexer } from '@/features/common/data'
import { lookupTransactionById } from '@algorandfoundation/algokit-utils'
import { atom } from 'jotai'
import { atomFam } from '@/features/common/data/atom-fam'
import { JotaiStore } from '@/features/common/data/types'

const createTransactionResultAtom = (transactionId: TransactionId) =>
  atom<Promise<TransactionResult> | TransactionResult>(async (_get) => {
    return lookupTransactionById(transactionId, indexer).then((result) => {
      return result.transaction
    })
  })

export const [transactionResultsAtom, getTransactionResultAtom] = atomFam((transactionId) => transactionId, createTransactionResultAtom)

// TODO: NC - We could potentially not wrap this in an atom and just return Array of atoms
// TODO: NC - There is probably a bit on the edges that need to adapt as well
export const getTransactionResultsAtom = (store: JotaiStore, transactionIds: TransactionId[]) => {
  return atom((get) => {
    return Promise.all(transactionIds.map((transactionId) => get(getTransactionResultAtom(store, transactionId))))
  })
}
