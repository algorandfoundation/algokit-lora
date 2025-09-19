import { algorandClient } from '@/features/common/data/algo-client'
import {
  betanetId,
  localnetId,
  mainnetId,
  testnetId,
  fnetId,
  BETANET_FEE_SINK_ADDRESS,
  FNET_FEE_SINK_ADDRESS,
  MAINNET_FEE_SINK_ADDRESS,
  selectedNetworkAtomId,
  TESTNET_FEE_SINK_ADDRESS,
} from '@/features/network/data'
import { settingsStore } from '@/features/settings/data'
import { atom } from 'jotai'
import { Address } from './types'

export const fundedAccountAtom = atom<Promise<Address | undefined>>(async () => {
  const selectedNetworkId = settingsStore.get(selectedNetworkAtomId)
  if (selectedNetworkId === mainnetId) {
    return MAINNET_FEE_SINK_ADDRESS
  }
  if (selectedNetworkId === testnetId) {
    return TESTNET_FEE_SINK_ADDRESS
  }
  if (selectedNetworkId === betanetId) {
    return BETANET_FEE_SINK_ADDRESS
  }
  if (selectedNetworkId === fnetId) {
    return FNET_FEE_SINK_ADDRESS
  }
  if (selectedNetworkId === localnetId) {
    return (await algorandClient.account.localNetDispenser()).addr.toString()
  }

  return undefined
})
