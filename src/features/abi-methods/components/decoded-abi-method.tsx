import { RenderLoadable } from '@/features/common/components/render-loadable'
import { AppCallTransaction, InnerAppCallTransaction } from '@/features/transactions/models'
import algosdk from 'algosdk'
import { useLoadableMaybeGroup } from '@/features/groups/data/maybe-group'
import { DecodedAbiMethodReturnValue } from '@/features/abi-methods/components/decoded-abi-method-return-value'
import { DecodedAbiMethodArguments } from '@/features/abi-methods/components/decoded-abi-method-arguments'

type Props = {
  transaction: AppCallTransaction | InnerAppCallTransaction
  abiMethod: algosdk.ABIMethod | undefined
}

export function DecodedAbiMethod({ transaction, abiMethod }: Props) {
  const loadableGroup = useLoadableMaybeGroup(transaction.confirmedRound, transaction.group)
  return (
    <RenderLoadable loadable={loadableGroup}>
      {({ group }) => {
        if (transaction.applicationArgs.length === 0) {
          return <span>No application args.</span>
        }
        if (!abiMethod) {
          return <span>Can't detect, maybe not ARC-32</span>
        }
        return (
          <div className="h-[450px] overflow-x-scroll">
            <span>{abiMethod.name}(</span>
            <DecodedAbiMethodArguments method={abiMethod} transaction={transaction} group={group} />
            ): <DecodedAbiMethodReturnValue method={abiMethod} transaction={transaction} />
          </div>
        )
      }}
    </RenderLoadable>
  )
}
