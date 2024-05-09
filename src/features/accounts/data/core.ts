import { atom } from 'jotai'
import { AccountResult, Address } from './types'

// TODO: Size should be capped at some limit, so memory usage doesn't grow indefinitely
export const accountResultsAtom = atom<Map<Address, AccountResult>>(new Map())
