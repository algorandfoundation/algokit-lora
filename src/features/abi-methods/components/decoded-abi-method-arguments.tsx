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
              <span>{argument.name}: </span>
              <TransactionLink className="text-primary underline" transactionId={argument.value}>
                {argument.value}
              </TransactionLink>
            </>
          )
        }
        if (argument.type === AbiType.Account) {
          return (
            <>
              <span>{argument.name}: </span>
              <AccountLink className="text-primary underline" address={argument.value}>
                {argument.value}
              </AccountLink>
            </>
          )
        }
        if (argument.type === AbiType.Application) {
          return (
            <>
              <span>{argument.name}: </span>
              <ApplicationLink className="text-primary underline" applicationId={argument.value}>
                {argument.value}
              </ApplicationLink>
            </>
          )
        }
        if (argument.type === AbiType.Asset) {
          return (
            <>
              <span>{argument.name}: </span>
              <AssetIdLink className="text-primary underline" assetId={argument.value}>
                {argument.value}
              </AssetIdLink>
            </>
          )
        }
        return (
          <>
            <span>{argument.name}: </span> <AbiValue abiValue={argument} />
          </>
        )
      }),
    [method.arguments]
  )

  return (
    <ul className="pl-4">
      {components.map((component, index, arr) => (
        <li key={index}>
          {component}
          {index < arr.length - 1 ? <span>{', '}</span> : null}
        </li>
      ))}
    </ul>
  )
}
