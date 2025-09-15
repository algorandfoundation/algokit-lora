import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { OptionalSenderFieldSchema } from '@/features/forms/components/address-form-item'
import { TESTNET_FEE_SINK_ADDRESS, MAINNET_FEE_SINK_ADDRESS, useNetworkConfig } from '@/features/network/data'
import { AddressOrNfd } from '../models'

export default async function defineSenderAddress<T extends OptionalSenderFieldSchema>(data: T): Promise<AddressOrNfd> {
  let senderAddress: AddressOrNfd
  const { id: networkId } = useNetworkConfig()
  if (!data.resolvedAddress || !data.value) {
    switch (networkId) {
      case 'mainnet': {
        senderAddress = { value: MAINNET_FEE_SINK_ADDRESS, resolvedAddress: MAINNET_FEE_SINK_ADDRESS, autoPopulated: true }
        break
      }
      case 'testnet': {
        senderAddress = { value: TESTNET_FEE_SINK_ADDRESS, resolvedAddress: TESTNET_FEE_SINK_ADDRESS, autoPopulated: true }
        break
      }
      case 'localnet': {
        const localnetClient = AlgorandClient.defaultLocalNet()

        const dispenserAccount = await localnetClient.account.localNetDispenser()
        senderAddress = { value: dispenserAccount.addr.toString(), resolvedAddress: dispenserAccount.addr.toString(), autoPopulated: true }
        break
      }
      default: {
        senderAddress = {
          value: MAINNET_FEE_SINK_ADDRESS,
          resolvedAddress: MAINNET_FEE_SINK_ADDRESS,
          autoPopulated: true,
        }
        break
      }
    }
  } else {
    senderAddress = { value: data.value, resolvedAddress: data.resolvedAddress, autoPopulated: false }
  }

  return senderAddress
}
