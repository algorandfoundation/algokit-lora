import { AbiArrayValue } from '@/features/abi-methods/components/abi-array-value'
import { AbiTupleValue } from '@/features/abi-methods/components/abi-tuple-value'
import { AbiValue as AbiValueModel, AbiType } from '@/features/abi-methods/models'
import { AccountLink } from '@/features/accounts/components/account-link'
import { AbiStructValue } from '@/features/abi-methods/components/abi-struct-value'

type Props = {
  abiValue: AbiValueModel
}

export function AbiValue({ abiValue }: Props) {
  if (abiValue.type === AbiType.Tuple) {
    return <AbiTupleValue tuple={abiValue} />
  }
  if (abiValue.type === AbiType.Struct) {
    return <AbiStructValue struct={abiValue} />
  }
  if (abiValue.type === AbiType.Array) {
    return <AbiArrayValue array={abiValue} />
  }
  if (abiValue.type === AbiType.String) {
    return <span className="text-abi-string">{`"${abiValue.value}"`}</span>
  }
  if (abiValue.type === AbiType.Uint) {
    return <span className="text-abi-number">{abiValue.value.toString()}</span>
  }
  if (abiValue.type === AbiType.Ufixed) {
    return <span className="text-abi-number">{abiValue.value}</span>
  }
  if (abiValue.type === AbiType.Boolean) {
    return <span className="text-abi-bool">{abiValue.value ? 'True' : 'False'}</span>
  }
  if (abiValue.type === AbiType.Address) {
    return <AccountLink address={abiValue.value} />
  }
}
