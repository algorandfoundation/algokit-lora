import { RenderAbiArrayValue } from '@/features/abi-methods/components/render-abi-array-value'
import { RenderAbiTupleValue } from '@/features/abi-methods/components/render-abi-tuple-value'
import { AbiPrimitiveValue, AbiValueType } from '@/features/abi-methods/models'

type Props = {
  abiValue: AbiPrimitiveValue
}

export function RenderAbiPrimitiveValue({ abiValue }: Props) {
  if (abiValue.type === AbiValueType.Tuple) {
    return <RenderAbiTupleValue tuple={abiValue} />
  }
  if (abiValue.type === AbiValueType.Array) {
    return <RenderAbiArrayValue array={abiValue} />
  }
  if (abiValue.type === AbiValueType.String) {
    return <span>{`"${abiValue.value}"`}</span>
  }
  return <span>{`${abiValue.value}`}</span>
}
