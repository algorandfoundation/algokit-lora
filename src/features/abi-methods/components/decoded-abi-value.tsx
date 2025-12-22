import { DecodedAbiArray } from '@/features/abi-methods/components/decoded-abi-array'
import { DecodedAbiTuple } from '@/features/abi-methods/components/decoded-abi-tuple'
import { AddressOrNfdLink } from '@/features/accounts/components/address-or-nfd-link'
import { DecodedAbiType, DecodedAbiValue as DecodedAbiValueModel } from '@/features/abi-methods/models'

type Props = {
  abiValue: DecodedAbiValueModel
}

export function DecodedAbiValue({ abiValue }: Props) {
  if (abiValue.type === DecodedAbiType.Tuple) {
    return <DecodedAbiTuple tuple={abiValue} />
  }
  if (abiValue.type === DecodedAbiType.Array) {
    return <DecodedAbiArray array={abiValue} />
  }
  if (abiValue.type === DecodedAbiType.String) {
    return <span className="text-abi-string">{`"${abiValue.value}"`}</span>
  }
  if (abiValue.type === DecodedAbiType.Uint) {
    return <span className="text-abi-number">{abiValue.value.toString()}</span>
  }
  if (abiValue.type === DecodedAbiType.Ufixed) {
    return <span className="text-abi-number">{abiValue.value}</span>
  }
  if (abiValue.type === DecodedAbiType.Boolean) {
    return <span className="text-abi-bool">{abiValue.value ? 'True' : 'False'}</span>
  }
  if (abiValue.type === DecodedAbiType.Address) {
    const addressArg = abiValue as { value: string }
    return <AddressOrNfdLink address={addressArg.value} />
  }
}
