import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { OptionalSenderFieldSchema } from '@/features/forms/components/address-form-item'
import { FEE_SINK_ADDRESS } from '@/features/network/data'
import { AddressOrNfd } from '../models'

export default async function defineSenderAddress<T extends OptionalSenderFieldSchema>(data: T, networkId: string): Promise<AddressOrNfd> {
  let senderAddress: AddressOrNfd
  if (!data.resolvedAddress || !data.value) {
    switch (networkId) {
      case 'mainnet':
        senderAddress = { value: FEE_SINK_ADDRESS, resolvedAddress: FEE_SINK_ADDRESS, autoPopulated: true }
        break
      case 'testnet':
        senderAddress = { value: FEE_SINK_ADDRESS, resolvedAddress: FEE_SINK_ADDRESS, autoPopulated: true }
        break
      case 'localnet':
        const localnetClient = AlgorandClient.defaultLocalNet()

        const dispenserAccount = await localnetClient.account.localNetDispenser()
        senderAddress = { value: dispenserAccount.addr.toString(), resolvedAddress: dispenserAccount.addr.toString(), autoPopulated: true }
        break
      default:
        senderAddress = {
          value: FEE_SINK_ADDRESS,
          resolvedAddress: FEE_SINK_ADDRESS,
          autoPopulated: true,
        }
        break
    }
  } else {
    senderAddress = { value: data.value, resolvedAddress: data.resolvedAddress, autoPopulated: false }
  }

  return senderAddress
}
