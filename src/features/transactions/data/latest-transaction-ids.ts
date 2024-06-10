import { atom } from 'jotai'
import { TransactionId } from './types'

export const latestTransactionIdsAtom = atom<(readonly [TransactionId, number])[]>([])
