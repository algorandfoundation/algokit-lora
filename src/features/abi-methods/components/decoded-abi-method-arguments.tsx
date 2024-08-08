import { useMemo } from 'react'
import { AbiMethod, AbiValueType } from '@/features/abi-methods/models'
import { RenderAbiValue } from '@/features/abi-methods/components/render-abi-value'
import { TransactionLink } from '@/features/transactions/components/transaction-link'
import { AccountLink } from '@/features/accounts/components/account-link'
import { ApplicationLink } from '@/features/applications/components/application-link'
import { AssetIdLink } from '@/features/assets/components/asset-link'

export function DecodedAbiMethodArguments({ method }: { method: AbiMethod }) {
  const components = useMemo(
    () =>
      method.arguments.map((argument) => {
        if (argument.type === AbiValueType.Transaction) {
          return (
            <>
              <span>{argument.name}:</span> <TransactionLink transactionId={argument.value} />
            </>
          )
        }
        if (argument.type === AbiValueType.Account) {
          return (
            <>
              <span>{argument.name}:</span> <AccountLink address={argument.value} />
            </>
          )
        }
        if (argument.type === AbiValueType.Application) {
          return (
            <>
              <span>{argument.name}:</span> <ApplicationLink applicationId={argument.value} />
            </>
          )
        }
        if (argument.type === AbiValueType.Asset) {
          return (
            <>
              <span>{argument.name}:</span> <AssetIdLink assetId={argument.value} />
            </>
          )
        }
        return (
          <div className="inline">
            <span>{argument.name}: </span> <RenderAbiValue abiValue={argument} />
          </div>
        )
      }),
    [method.arguments]
  )

  return (
    <ul className={'pl-4'}>
      {components.map((component, index, arr) => (
        <li key={index}>
          <>
            {component}
            {index < arr.length - 1 ? <span>{', '}</span> : null}
          </>
        </li>
      ))}
    </ul>
  )
}
