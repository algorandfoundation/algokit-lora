import { atom, useAtomValue } from 'jotai'
import { Round } from './types'

// TODO: HB - FNet Block 3811103, has a hb transaction (S257NEWKKXQPBRZ4KDZMTL2PBKP6QTBNXUADHB2UZELXIHBYUVAA), uncomment this to test block polling
// export const syncedRoundAtom = atom<Round | undefined>(3811102)
export const syncedRoundAtom = atom<Round | undefined>(undefined)

export const useSyncedRound = () => {
  return useAtomValue(syncedRoundAtom)
}
