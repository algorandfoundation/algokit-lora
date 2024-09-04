import { AbiValue } from '@/features/abi-methods/components/abi-value'
import { AbiMethod } from '@/features/abi-methods/models'
import { asAbiValueRender } from '@/features/abi-methods/mappers'

export function DecodedAbiMethodReturnValue({ method }: { method: AbiMethod }) {
  const methodReturn = method.return
  if (methodReturn === 'void') return 'void'
  const methodReturnRender = asAbiValueRender(methodReturn)
  return <AbiValue abiValue={methodReturnRender} />
}
