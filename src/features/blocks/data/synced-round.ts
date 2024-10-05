import { atom, useAtomValue } from 'jotai'
import { Round } from './types'

export const syncedRoundAtom = atom<Round | undefined>(undefined)

export const useSyncedRound = () => {
  return useAtomValue(syncedRoundAtom)
}
