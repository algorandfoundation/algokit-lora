import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { OptionalAddressOrNfdFieldSchema } from '@/features/forms/components/address-form-item'
import { FEE_SINK_ADDRESS } from '@/features/network/data'
import { AddressOrNfd } from '../models'

// TODO Arthur - Optional sender - This is a basic function to define the correct sender of the empty address based on the network being used
export default async function defineSenderAddress<T extends OptionalAddressOrNfdFieldSchema>(
  data: T,
  networkId: string
): Promise<{ value: string; resolvedAddress: string }> {
  let senderAddress: AddressOrNfd

  if (!data.resolvedAddress || !data.value) {
    switch (networkId) {
      case 'mainnet':
        senderAddress = { value: FEE_SINK_ADDRESS, resolvedAddress: FEE_SINK_ADDRESS }
        break
      case 'testnet':
        senderAddress = { value: FEE_SINK_ADDRESS, resolvedAddress: FEE_SINK_ADDRESS }
        break
      case 'localnet':
        const localnetClient = AlgorandClient.defaultLocalNet()

        const dispenserAccount = await localnetClient.account.localNetDispenser()
        senderAddress = { value: dispenserAccount.addr.toString(), resolvedAddress: dispenserAccount.addr.toString() }
        break
      default:
        senderAddress = {
          value: FEE_SINK_ADDRESS,
          resolvedAddress: FEE_SINK_ADDRESS,
        }
        break
    }
  } else {
    senderAddress = { value: data.value, resolvedAddress: data.resolvedAddress }
  }

  return {
    value: senderAddress.value!,
    resolvedAddress: senderAddress.resolvedAddress!,
  }
}
