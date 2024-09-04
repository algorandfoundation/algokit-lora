import { AbiArrayValue } from '@/features/abi-methods/components/abi-array-value'
import { AbiTupleValue } from '@/features/abi-methods/components/abi-tuple-value'
import { AbiValueRender, AbiType } from '@/features/abi-methods/models'

type Props = {
  abiValue: AbiValueRender
}

export function AbiValue({ abiValue }: Props) {
  if (abiValue.type === AbiType.Tuple) {
    return <AbiTupleValue tuple={abiValue} />
  }
  if (abiValue.type === AbiType.Array) {
    return <AbiArrayValue array={abiValue} />
  }
  if (abiValue.type === AbiType.String) {
    return <span>{`"${abiValue.value}"`}</span>
  }
  return <span>{`${abiValue.value}`}</span>
}
