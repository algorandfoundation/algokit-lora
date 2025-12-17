import {
  TESTNET_FEE_SINK_ADDRESS,
  MAINNET_FEE_SINK_ADDRESS,
  networkConfigAtom,
  BETANET_FEE_SINK_ADDRESS,
  FNET_FEE_SINK_ADDRESS,
} from '@/features/network/data'
import { TransactionSender } from '../models'
import { settingsStore } from '@/features/settings/data'
import { betanetId, mainnetId, testnetId, fnetId, localnetId } from '@/features/network/data'
import { algorandClient } from '@/features/common/data/algo-client'

export async function resolveTransactionSender(data: { value?: string; resolvedAddress?: string }): Promise<TransactionSender> {
  const val = data.value ?? ''

  if (val) {
    return data as TransactionSender
  }

  const { id: networkId } = settingsStore.get(networkConfigAtom)

  if (networkId === mainnetId) {
    return { value: MAINNET_FEE_SINK_ADDRESS, resolvedAddress: MAINNET_FEE_SINK_ADDRESS, autoPopulated: true }
  }
  if (networkId === localnetId) {
    const address = (await algorandClient.account.localNetDispenser()).addr.toString()
    return { value: address, resolvedAddress: address, autoPopulated: true }
  }
  if (networkId === fnetId) {
    return { value: FNET_FEE_SINK_ADDRESS, resolvedAddress: FNET_FEE_SINK_ADDRESS, autoPopulated: true }
  }
  if (networkId === betanetId) {
    return { value: BETANET_FEE_SINK_ADDRESS, resolvedAddress: BETANET_FEE_SINK_ADDRESS, autoPopulated: true }
  }
  if (networkId === testnetId) {
    return { value: TESTNET_FEE_SINK_ADDRESS, resolvedAddress: TESTNET_FEE_SINK_ADDRESS, autoPopulated: true }
  }

  return data as TransactionSender
}
