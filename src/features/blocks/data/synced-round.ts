import { atom, useAtomValue } from 'jotai'
import { Round } from './types'

// TODO: HB - FNet Block 4590103, has a hb transaction (3HUZDAXUGHS44RJ4BQ6HOMWZCGOJW5WWOQ5CR7XHSZHFP2ZQCDOA), uncomment this to test block polling
// export const syncedRoundAtom = atom<Round | undefined>(4590102)
export const syncedRoundAtom = atom<Round | undefined>(undefined)

export const useSyncedRound = () => {
  return useAtomValue(syncedRoundAtom)
}
