import { RenderAbiArrayValue } from '@/features/abi-methods/components/render-abi-array-value'
import { RenderAbiTupleValue } from '@/features/abi-methods/components/render-abi-tuple-value'
import { AbiPrimitiveValue, AbiValueType } from '@/features/abi-methods/models'
import algosdk from 'algosdk'

type Props = {
  abiValue: AbiPrimitiveValue
}

export function RenderAbiValue({ abiValue }: Props) {
  if (abiValue.type === AbiValueType.Tuple) {
    return <RenderAbiTupleValue tuple={abiValue} />
  }
  if (abiValue.type === AbiValueType.Array) {
    return <RenderAbiArrayValue array={abiValue} />
  }
  if (abiValue.type === AbiValueType.String) {
    return <span>{`"${abiValue.value}"`}</span>
  }
  if (abiValue.type === AbiValueType.Address) {
    return <span>{algosdk.encodeAddress(abiValue.value)}</span>
  }
  return <span>{`${abiValue.value}`}</span>
}
