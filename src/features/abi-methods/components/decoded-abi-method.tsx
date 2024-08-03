import { AppCallTransaction, InnerAppCallTransaction } from '@/features/transactions/models'
import { DecodedAbiMethodReturnValue } from '@/features/abi-methods/components/decoded-abi-method-return-value'
import { DecodedAbiMethodArguments } from '@/features/abi-methods/components/decoded-abi-method-arguments'
import { AbiMethod } from '@/features/abi-methods/models'

type Props = {
  transaction: AppCallTransaction | InnerAppCallTransaction
  abiMethod: AbiMethod | undefined
}

export function DecodedAbiMethod({ transaction, abiMethod }: Props) {
  if (transaction.applicationArgs.length === 0) {
    return <span>No application args.</span>
  }
  if (!abiMethod) {
    return <span>Can't detect, maybe not ARC-32</span>
  }
  return (
    <div className="h-[450px] overflow-x-scroll">
      <span>{abiMethod.name}(</span>
      <DecodedAbiMethodArguments method={abiMethod} />
      ): <DecodedAbiMethodReturnValue method={abiMethod} />
    </div>
  )
}
