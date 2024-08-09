import { useMemo } from 'react'
import { AbiMethod, AbiType } from '@/features/abi-methods/models'
import { AbiValue } from '@/features/abi-methods/components/abi-value'
import { TransactionLink } from '@/features/transactions/components/transaction-link'
import { AccountLink } from '@/features/accounts/components/account-link'
import { ApplicationLink } from '@/features/applications/components/application-link'
import { AssetIdLink } from '@/features/assets/components/asset-link'

export function DecodedAbiMethodArguments({ method }: { method: AbiMethod }) {
  const components = useMemo(
    () =>
      method.arguments.map((argument) => {
        if (argument.type === AbiType.Transaction) {
          return (
            <>
              <span>{argument.name}:</span> <TransactionLink transactionId={argument.value} />
            </>
          )
        }
        if (argument.type === AbiType.Account) {
          return (
            <>
              <span>{argument.name}:</span> <AccountLink address={argument.value} />
            </>
          )
        }
        if (argument.type === AbiType.Application) {
          return (
            <>
              <span>{argument.name}:</span> <ApplicationLink applicationId={argument.value} />
            </>
          )
        }
        if (argument.type === AbiType.Asset) {
          return (
            <>
              <span>{argument.name}:</span> <AssetIdLink assetId={argument.value} />
            </>
          )
        }
        return (
          <div className="inline">
            <span>{argument.name}: </span> <AbiValue abiValue={argument} />
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
