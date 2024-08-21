import { algod } from '@/features/common/data/algo-client'
import { atomWithDefault, useAtomCallback } from 'jotai/utils'
import { useCallback } from 'react'

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

export const useNetworkMatchesCachedData = () => {
  return useAtomCallback(
    useCallback(async (get) => {
      const nextGenesisHash = await getGenesisHash()
      const genesisHash = await get(genesisHashAtom)

      return !genesisHash || genesisHash === nextGenesisHash
    }, [])
  )
}
