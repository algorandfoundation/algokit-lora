import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { atom } from 'jotai'
import { TransactionId } from './types'

// TODO: Size should be capped at some limit, so memory usage doesn't grow indefinitely
export const transactionResultsAtom = atom<Map<TransactionId, TransactionResult>>(new Map())
