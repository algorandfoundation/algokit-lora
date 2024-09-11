import { DecodedAbiMethodReturnValue } from '@/features/abi-methods/components/decoded-abi-method-return-value'
import { DecodedAbiMethodArguments } from '@/features/abi-methods/components/decoded-abi-method-arguments'
import { AbiMethod } from '@/features/abi-methods/models'
import { getAbiMethodRepresentation } from '../mappers'
import { useMemo } from 'react'

type Props = {
  abiMethod: AbiMethod
}

export function DecodedAbiMethod({ abiMethod }: Props) {
  const abiMethodRepresentation = useMemo(() => getAbiMethodRepresentation(abiMethod), [abiMethod])
  return (
    <div className="max-h-[450px] overflow-x-auto">
      <div>
        <span>{abiMethodRepresentation.name}(</span>
        <DecodedAbiMethodArguments arguments={abiMethodRepresentation.arguments} multiLine={abiMethodRepresentation.multiLine} />)
      </div>
      <div className="mt-4">
        <span>Returns: </span>
        <DecodedAbiMethodReturnValue returnRepresentation={abiMethodRepresentation.return} />
      </div>
    </div>
  )
}
