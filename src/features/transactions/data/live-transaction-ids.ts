import { atom } from 'jotai'
import { TransactionId } from './types'

export const liveTransactionIdsAtom = atom<TransactionId[]>([])
