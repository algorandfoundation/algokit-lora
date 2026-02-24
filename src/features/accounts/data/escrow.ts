import { EscregSDK } from '@d13co/escreg-sdk'
import { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { loadable } from 'jotai/utils'
import { readOnlyAtomCache } from '@/features/common/data/atom-cache'

// currently escreg deployment is on FNet and serves all networks
// no need to pass in per-network algorandClient / config
const sdk = new EscregSDK({})

const getEscrowAppId = async (address: string) => {
  const result = await sdk.lookup({ addresses: [address] })
  return result[address]
}

const [escrowAppIdResultsAtom, getEscrowAppIdAtom] = readOnlyAtomCache(
  (_get, _set, address: string) => getEscrowAppId(address),
  (address) => address
)
export { escrowAppIdResultsAtom }

export const useLoadableEscrowAppId = (address: string) => {
  const escrowAtom = useMemo(() => {
    return getEscrowAppIdAtom(address)
  }, [address])
  return useAtomValue(loadable(escrowAtom))
}
