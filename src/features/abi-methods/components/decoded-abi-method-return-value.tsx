import { AbiMethodReturnRepresentation } from '@/features/abi-methods/models'
import { AbiValue } from '@/features/abi-methods/components/abi-value'

type Props = {
  returnRepresentation: AbiMethodReturnRepresentation
}

export function DecodedAbiMethodReturnValue({ returnRepresentation }: Props) {
  if (returnRepresentation === 'void') return 'void'
  return <AbiValue abiValue={returnRepresentation} />
}
