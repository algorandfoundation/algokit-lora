import { DecodedAbiMethodReturnValue } from '@/features/abi-methods/components/decoded-abi-method-return-value'
import { DecodedAbiMethodArguments } from '@/features/abi-methods/components/decoded-abi-method-arguments'
import { AbiMethod } from '@/features/abi-methods/models'

type Props = {
  abiMethod: AbiMethod
}

export function DecodedAbiMethod({ abiMethod }: Props) {
  return (
    <div className="max-h-[450px] overflow-x-auto">
      <div>
        <span>{abiMethod.name}(</span>
        <DecodedAbiMethodArguments arguments={abiMethod.arguments} multiline={abiMethod.multiline} />)
      </div>
      <div className="mt-4">
        <span>Returns: </span>
        <DecodedAbiMethodReturnValue return={abiMethod.return} />
      </div>
    </div>
  )
}
