import { useMemo } from 'react'
import { AbiMethod, AbiType } from '@/features/abi-methods/models'
import { AbiValue } from '@/features/abi-methods/components/abi-value'
import { TransactionLink } from '@/features/transactions/components/transaction-link'
import { AccountLink } from '@/features/accounts/components/account-link'
import { ApplicationLink } from '@/features/applications/components/application-link'
import { AssetIdLink } from '@/features/assets/components/asset-link'
import { getAbiMethodRepresentation } from '@/features/abi-methods/mappers'

export function DecodedAbiMethodArguments({ method }: { method: AbiMethod }) {
  const methodRepresentation = useMemo(() => getAbiMethodRepresentation(method), [method])

  const components = useMemo(
    () =>
      methodRepresentation.arguments.map((argument) => {
        if (argument.type === AbiType.Transaction) {
          return (
            <>
              <span className="text-abi-keys">{argument.name}: </span>
              <TransactionLink className="text-primary underline" transactionId={argument.value}>
                {argument.value}
              </TransactionLink>
            </>
          )
        }
        if (argument.type === AbiType.Account) {
          return (
            <>
              <span className="text-abi-keys">{argument.name}: </span>
              <AccountLink className="text-primary underline" address={argument.value}>
                {argument.value}
              </AccountLink>
            </>
          )
        }
        if (argument.type === AbiType.Application) {
          return (
            <>
              <span className="text-abi-keys">{argument.name}: </span>
              <ApplicationLink className="text-primary underline" applicationId={argument.value}>
                {argument.value}
              </ApplicationLink>
            </>
          )
        }
        if (argument.type === AbiType.Asset) {
          return (
            <>
              <span className="text-abi-keys">{argument.name}: </span>
              <AssetIdLink className="text-primary underline" assetId={argument.value}>
                {argument.value}
              </AssetIdLink>
            </>
          )
        }
        return (
          <>
            <span className="text-abi-keys">{argument.name}: </span> <AbiValue abiValue={argument} />
          </>
        )
      }),
    [methodRepresentation]
  )

  if (methodRepresentation.multiLine) {
    return (
      <ul className="pl-4">
        {components.map((component, index, array) => (
          <li key={index}>
            <>
              {component}
              {index < array.length - 1 ? <span>{', '}</span> : null}
            </>
          </li>
        ))}
      </ul>
    )
  } else {
    return (
      <div className="inline">
        {components.map((component, index, array) => (
          <div className="inline" key={index}>
            {component}
            {index < array.length - 1 ? <span>{', '}</span> : null}
          </div>
        ))}
      </div>
    )
  }
}
