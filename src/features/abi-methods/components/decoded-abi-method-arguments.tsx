import { useMemo } from 'react'
import { AbiMethod, AbiType } from '@/features/abi-methods/models'
import { AbiValue } from '@/features/abi-methods/components/abi-value'
import { TransactionLink } from '@/features/transactions/components/transaction-link'
import { AccountLink } from '@/features/accounts/components/account-link'
import { ApplicationLink } from '@/features/applications/components/application-link'
import { AssetIdLink } from '@/features/assets/components/asset-link'
import { asAbiMethodArgumentRender } from '@/features/abi-methods/mappers'
import { sum } from '@/utils/sum'

export function DecodedAbiMethodArguments({ method }: { method: AbiMethod }) {
  const argumentsRender = useMemo(() => method.arguments.map((argument) => asAbiMethodArgumentRender(argument)), [method.arguments])

  const components = useMemo(
    () =>
      argumentsRender.map((argument) => {
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
    [argumentsRender]
  )

  const multiLine = argumentsRender.some((argument) => argument.multiLine) || sum(argumentsRender.map((argument) => argument.length)) > 20
  if (multiLine) {
    return (
      <ul className="pl-4">
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
  } else {
    return (
      <div className="inline">
        {components.map((component, index, arr) => (
          <div key={index}>
            {component}
            {index < arr.length - 1 ? <span>{', '}</span> : null}
          </div>
        ))}
      </div>
    )
  }
}
