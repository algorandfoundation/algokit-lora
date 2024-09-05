import { AbiValue } from '@/features/abi-methods/components/abi-value'
import { AbiMethodReturn } from '../models'

export function DecodedAbiMethodReturnValue({ methodReturn }: { methodReturn: AbiMethodReturn }) {
  if (methodReturn === 'void') return 'void'
  return <AbiValue abiValue={methodReturn} />
}
