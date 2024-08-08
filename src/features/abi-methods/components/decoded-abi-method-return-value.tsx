import { RenderAbiValue } from '@/features/abi-methods/components/render-abi-value'
import { AbiMethod } from '@/features/abi-methods/models'

export function DecodedAbiMethodReturnValue({ method }: { method: AbiMethod }) {
  const methodReturn = method.return
  if (methodReturn === 'void') return 'void'
  return <RenderAbiValue abiValue={methodReturn} />
}
