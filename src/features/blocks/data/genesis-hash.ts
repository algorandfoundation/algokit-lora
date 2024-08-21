import { algod } from '@/features/common/data/algo-client'
import { atom, useSetAtom } from 'jotai'
import { atomWithDefault } from 'jotai/utils'

const getGenesisHash = () =>
  algod
    .versionsCheck()
    .do()
    .then((result) => {
      return result.genesis_hash_b64 as string
    })

export const genesisHashAtom = atomWithDefault<string | Promise<string>>(async () => {
  return await getGenesisHash()
})

const networkMatchesCachedDataAtom = atom(null, async (get) => {
  const nextGenesisHash = await getGenesisHash()
  const genesisHash = await get(genesisHashAtom)

  return !genesisHash || genesisHash === nextGenesisHash
})

export const useNetworkMatchesCachedData = () => {
  return useSetAtom(networkMatchesCachedDataAtom)
}
