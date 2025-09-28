import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { OptionalSenderFieldSchema } from '@/features/forms/components/address-form-item'
import { TESTNET_FEE_SINK_ADDRESS, MAINNET_FEE_SINK_ADDRESS, networkConfigAtom } from '@/features/network/data'
import { AddressOrNfd, TransactionSender } from '../models'
import { settingsStore } from '@/features/settings/data'

export default async function resolveSenderAddress<T extends OptionalSenderFieldSchema>(
  data: T
): Promise<AddressOrNfd & TransactionSender> {
  const { id: networkId } = settingsStore.get(networkConfigAtom)

  const val = data?.value ?? ''
  const res = data?.resolvedAddress ?? ''

  const isEmpty = !val && !res

  if (isEmpty) {
    switch (networkId) {
      case 'mainnet':
        return { value: MAINNET_FEE_SINK_ADDRESS, resolvedAddress: MAINNET_FEE_SINK_ADDRESS, autoPopulated: true }
      case 'testnet':
        return { value: TESTNET_FEE_SINK_ADDRESS, resolvedAddress: TESTNET_FEE_SINK_ADDRESS, autoPopulated: true }
      case 'localnet': {
        const localnetClient = AlgorandClient.defaultLocalNet()
        const dispenser = await localnetClient.account.localNetDispenser()
        const addr = dispenser.addr.toString()
        return { value: addr, resolvedAddress: addr, autoPopulated: true }
      }
      default:
        return { value: MAINNET_FEE_SINK_ADDRESS, resolvedAddress: MAINNET_FEE_SINK_ADDRESS, autoPopulated: true }
    }
  }

  return {
    value: val || res,
    resolvedAddress: res || val,
    autoPopulated: false,
  }
}
