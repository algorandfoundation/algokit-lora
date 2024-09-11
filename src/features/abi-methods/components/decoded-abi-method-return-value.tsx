import { AbiMethodReturnRepresentation } from '@/features/abi-methods/models'
import { AbiValue } from '@/features/abi-methods/components/abi-value'

type Props = {
  return: AbiMethodReturnRepresentation
}

export function DecodedAbiMethodReturnValue({ return: returnProp }: Props) {
  if (returnProp === 'void') return 'void'
  return <AbiValue abiValue={returnProp} />
}
