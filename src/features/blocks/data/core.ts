import { atom } from 'jotai'
import { BlockResult, Round } from './types'

export const syncedRoundAtom = atom<Round | undefined>(undefined)

// TODO: Size should be capped at some limit, so memory usage doesn't grow indefinitely
export const blocksAtom = atom<Map<Round, BlockResult>>(new Map())
