import { DecodedAbiMethodArguments } from '@/features/abi-methods/components/decoded-abi-method-arguments'
import { DecodedAbiMethodReturnValue } from '@/features/abi-methods/components/decoded-abi-method-return-value'
import { DecodedAbiMethod as DecodedAbiMethodModel } from '@/features/abi-methods/models'

type Props = {
  abiMethod: DecodedAbiMethodModel
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
