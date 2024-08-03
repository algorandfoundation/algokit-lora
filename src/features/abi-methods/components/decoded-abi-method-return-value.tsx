import { RenderAbiPrimitiveValue } from '@/features/abi-methods/components/render-abi-primitive-value'
import { AbiMethod } from '@/features/abi-methods/models'

export function DecodedAbiMethodReturnValue({ method }: { method: AbiMethod }) {
  const methodReturn = method.return
  if (methodReturn === 'void') return 'void'
  return <RenderAbiPrimitiveValue abiValue={methodReturn} />
}
