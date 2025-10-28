import { algod } from '@/features/common/data/algo-client'
import { uint8ArrayToBase64 } from '@/utils/uint8-array-to-base64'
import { atomWithDefault, useAtomCallback } from 'jotai/utils'
import { useCallback } from 'react'

const getGenesisHash = () =>
  algod.getVersion().then((result) => {
    return uint8ArrayToBase64(result.genesisHashB64)
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
