import { AbiMethodArgument, AbiType } from '@/features/abi-methods/models'
import { AbiValue } from '@/features/abi-methods/components/abi-value'
import { TransactionLink } from '@/features/transactions/components/transaction-link'
import { AccountLink } from '@/features/accounts/components/account-link'
import { ApplicationLink } from '@/features/applications/components/application-link'
import { AssetIdLink } from '@/features/assets/components/asset-link'
import { useMemo, useCallback } from 'react'

type Props = {
  arguments: AbiMethodArgument[]
  multiline: boolean
}
export function DecodedAbiMethodArguments({ arguments: argumentsProp, multiline }: Props) {
  const renderArgumentValue = useCallback((argument: AbiMethodArgument) => {
    if (argument.type === AbiType.Transaction) {
      return (
        <TransactionLink className="text-primary underline" transactionId={argument.value}>
          {argument.value}
        </TransactionLink>
      )
    } else if (argument.type === AbiType.Account) {
      return (
        <AccountLink className="text-primary underline" address={argument.value}>
          {argument.value}
        </AccountLink>
      )
    } else if (argument.type === AbiType.Application) {
      return (
        <ApplicationLink className="text-primary underline" applicationId={argument.value}>
          {argument.value}
        </ApplicationLink>
      )
    } else if (argument.type === AbiType.Asset) {
      return (
        <AssetIdLink className="text-primary underline" assetId={argument.value}>
          {argument.value}
        </AssetIdLink>
      )
    } else {
      return <AbiValue abiValue={argument} />
    }
  }, [])

  const components = useMemo(
    () =>
      argumentsProp.map((argument) => (
        <>
          <span className="text-abi-keys">{argument.name}: </span>
          {renderArgumentValue(argument)}
        </>
      )),
    [argumentsProp, renderArgumentValue]
  )

  if (multiline) {
    return (
      <ol className="pl-4">
        {components.map((component, index, array) => (
          <li key={index}>
            <>
              {component}
              {index < array.length - 1 ? <span>{', '}</span> : null}
            </>
          </li>
        ))}
      </ol>
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
