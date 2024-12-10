import { DecodedAbiValue } from '@/features/abi-methods/components/decoded-abi-value'
import { TransactionLink } from '@/features/transactions/components/transaction-link'
import { ApplicationLink } from '@/features/applications/components/application-link'
import { AssetIdLink } from '@/features/assets/components/asset-link'
import { useCallback, useMemo } from 'react'
import { AddressOrNfdLink } from '@/features/accounts/components/address-or-nfd-link'
import { DecodedAbiMethodArgument, DecodedAbiType } from '@/features/abi-methods/models'
import { DecodedAbiStruct } from '@/features/abi-methods/components/decoded-abi-struct'

type Props = {
  arguments: DecodedAbiMethodArgument[]
  multiline: boolean
}
export function DecodedAbiMethodArguments({ arguments: argumentsProp, multiline }: Props) {
  const renderArgumentValue = useCallback((argument: DecodedAbiMethodArgument) => {
    if (argument.type === DecodedAbiType.Transaction) {
      return (
        <TransactionLink className="text-primary underline" transactionId={argument.value}>
          {argument.value}
        </TransactionLink>
      )
    } else if (argument.type === DecodedAbiType.Account) {
      return (
        <AddressOrNfdLink className="text-primary underline" address={argument.value}>
          {argument.value}
        </AddressOrNfdLink>
      )
    } else if (argument.type === DecodedAbiType.Application) {
      return (
        <ApplicationLink className="text-primary underline" applicationId={argument.value}>
          {argument.value.toString()}
        </ApplicationLink>
      )
    } else if (argument.type === DecodedAbiType.Asset) {
      return (
        <AssetIdLink className="text-primary underline" assetId={argument.value}>
          {argument.value.toString()}
        </AssetIdLink>
      )
    } else if (argument.type === DecodedAbiType.Struct) {
      return <DecodedAbiStruct struct={argument} />
    } else {
      return <DecodedAbiValue abiValue={argument} />
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
