import { AppCallTransaction, InnerAppCallTransaction } from '@/features/transactions/models'
import algosdk, { ABIReferenceType } from 'algosdk'
import { RenderABIValue } from '@/features/abi-methods/components/render-abi-type-value'

export function DecodedAbiMethodArgument({
  transaction,
  argumentSpec,
  argumentValue,
}: {
  transaction: AppCallTransaction | InnerAppCallTransaction
  argumentSpec: algosdk.ABIMethod['args'][0]
  argumentValue: algosdk.ABIValue
}) {
  if (argumentSpec.type === ABIReferenceType.asset) {
    return `${argumentSpec.name}: ${transaction.foreignAssets[Number(argumentValue)]}`
  }
  if (argumentSpec.type === ABIReferenceType.account) {
    const accountIndex = Number(argumentValue)
    // Index 0 of application accounts is the sender
    if (accountIndex === 0) {
      return `${argumentSpec.name}: ${transaction.sender}`
    } else {
      return `${argumentSpec.name}: ${transaction.applicationAccounts[accountIndex - 1]}`
    }
  }
  if (argumentSpec.type === ABIReferenceType.application) {
    const applicationIndex = Number(argumentValue)
    // Index 0 of foreign apps is the called app
    if (applicationIndex === 0) {
      return `${argumentSpec.name}: ${transaction.applicationId}`
    } else {
      return `${argumentSpec.name}: ${transaction.foreignApps[applicationIndex - 1]}`
    }
  }

  return (
    <>
      {argumentSpec.name}: <RenderABIValue type={argumentSpec.type as algosdk.ABIType} value={argumentValue} />
    </>
  )
}
