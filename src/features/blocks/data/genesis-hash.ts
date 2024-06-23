import { algod } from '@/features/common/data/algo-client'
import { atom, useSetAtom } from 'jotai'

const getGenesisHash = () =>
  algod
    .versionsCheck()
    .do()
    .then((result) => {
      return result.genesis_hash_b64 as string
    })

export const genesisHashAtom = atom<string | null>(null)

const networkMatchesCachedDataAtom = atom(null, async (get) => {
  const nextGenesisHash = await getGenesisHash()
  const genesisHash = get(genesisHashAtom)

  return !genesisHash || genesisHash === nextGenesisHash
})

export const useNetworkMatchesCachedData = () => {
  return useSetAtom(networkMatchesCachedDataAtom)
}
