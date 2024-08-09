import { DecodedAbiMethodReturnValue } from '@/features/abi-methods/components/decoded-abi-method-return-value'
import { DecodedAbiMethodArguments } from '@/features/abi-methods/components/decoded-abi-method-arguments'
import { AbiMethod } from '@/features/abi-methods/models'

type Props = {
  abiMethod: AbiMethod
}

export function DecodedAbiMethod({ abiMethod }: Props) {
  return (
    <div className="max-h-[450px] overflow-x-scroll">
      <div>
        <span>{abiMethod.name}(</span>
        <DecodedAbiMethodArguments method={abiMethod} />)
      </div>
      <div className={'my-4'} />
      <div>
        <span>Returns: </span>
        <div className="inline">
          <DecodedAbiMethodReturnValue method={abiMethod} />
        </div>
      </div>
    </div>
  )
}
