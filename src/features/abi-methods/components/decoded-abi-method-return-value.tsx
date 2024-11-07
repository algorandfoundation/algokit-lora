import { DecodedAbiValue } from '@/features/abi-methods/components/decoded-abi-value'
import { DecodedAbiMethodReturn, DecodedAbiType } from '@/features/abi-methods/models'
import { DecodedAbiStruct } from '@/features/abi-methods/components/decoded-abi-struct'

type Props = {
  return: DecodedAbiMethodReturn
}

export function DecodedAbiMethodReturnValue({ return: returnProp }: Props) {
  if (returnProp === 'void') return 'void'
  if (returnProp.type === DecodedAbiType.Struct) return <DecodedAbiStruct struct={returnProp} />
  return <DecodedAbiValue abiValue={returnProp} />
}
