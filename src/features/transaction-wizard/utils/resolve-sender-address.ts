import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { OptionalSenderFieldSchema } from '@/features/forms/components/address-form-item'
import {
  TESTNET_FEE_SINK_ADDRESS,
  MAINNET_FEE_SINK_ADDRESS,
  networkConfigAtom,
  BETANET_FEE_SINK_ADDRESS,
  FNET_FEE_SINK_ADDRESS,
} from '@/features/network/data'
import { AddressOrNfd, TransactionSender } from '../models'
import { settingsStore } from '@/features/settings/data'
import { betanetId, mainnetId, testnetId, fnetId, localnetId } from '@/features/network/data'
import { algorandClient } from '@/features/common/data/algo-client'

export default async function resolveSenderAddress<T extends OptionalSenderFieldSchema>(
  data: T
): Promise<AddressOrNfd & TransactionSender> {
  const { id: networkId } = settingsStore.get(networkConfigAtom)

  const val = data?.value ?? ''
  const res = data?.resolvedAddress ?? ''

  const isEmpty = !val && !res

  if (isEmpty) {
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
    if (networkId === mainnetId) {
      return { value: MAINNET_FEE_SINK_ADDRESS, resolvedAddress: MAINNET_FEE_SINK_ADDRESS, autoPopulated: true }
    }
  }

  return {
    value: val || res,
    resolvedAddress: res || val,
    autoPopulated: false,
  }
}
