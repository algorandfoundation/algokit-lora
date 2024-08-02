import algosdk, { ABIReferenceType } from 'algosdk'
import { AppCallTransaction, InnerAppCallTransaction, Transaction } from '@/features/transactions/models'
import { Group } from '@/features/groups/models'
import { useMemo } from 'react'
import { base64ToBytes } from '@/utils/base64-to-bytes'
import { DecodedAbiMethodArgument } from '@/features/abi-methods/components/decoded-abi-method-argument'

export function DecodedAbiMethodArguments({
  method,
  transaction,
  group,
}: {
  method: algosdk.ABIMethod
  transaction: AppCallTransaction | InnerAppCallTransaction
  group: Group | undefined
}) {
  // Ignore the first arg, which is the method selector
  const transactionArgs = transaction.applicationArgs.slice(1)
  let transactionArgIndex = 0

  const referencedTransactions = extractReferencedTransactionsFromGroup(transaction, group, method)

  const nonTransactionTypeArgs = method.args.filter((arg) => !algosdk.abiTypeIsTransaction(arg.type))
  // If there are more than 15 args, the args from 15 to the end are encoded inside a tuple
  const argsBeyond15thTuple: algosdk.ABIValue[] = useMemo(() => {
    const results: algosdk.ABIValue[] = []
    if (nonTransactionTypeArgs.length > 15) {
      const argsEncodedInsideTheLastTuple = nonTransactionTypeArgs.slice(14)
      const lastTupleType = new algosdk.ABITupleType(
        argsEncodedInsideTheLastTuple.map((arg) =>
          // if the arg is a reference type, then it is an uint8
          // transaction args were filtered out earlier
          !algosdk.abiTypeIsReference(arg.type) ? (arg.type as algosdk.ABIType) : new algosdk.ABIUintType(8)
        )
      )
      const bytes = base64ToBytes(transactionArgs[14])
      results.push(...lastTupleType.decode(bytes))
    }
    return results
  }, [nonTransactionTypeArgs, transactionArgs])

  const listItems = useMemo(
    () =>
      method.args.map((argumentSpec, index) => {
        if (algosdk.abiTypeIsTransaction(argumentSpec.type)) {
          const transaction = referencedTransactions.shift()!
          return `${argumentSpec.name}: ${transaction.id}`
        }

        const abiValue =
          transactionArgIndex === 14 && argsBeyond15thTuple.length > 0
            ? argsBeyond15thTuple.shift()!
            : mapAbiArgumentToAbiValue(argumentSpec.type, transactionArgs[transactionArgIndex++])
        return <DecodedAbiMethodArgument key={index} transaction={transaction} argumentSpec={argumentSpec} argumentValue={abiValue} />
      }),
    [argsBeyond15thTuple, method.args, referencedTransactions, transaction, transactionArgIndex, transactionArgs]
  )

  return (
    <ul className={'pl-4'}>
      {listItems.map((listItem, index, arr) => (
        <li key={index}>
          <>
            {listItem}
            {index < arr.length - 1 ? ', ' : ''}
          </>
        </li>
      ))}
    </ul>
  )
}

const mapAbiArgumentToAbiValue = (type: algosdk.ABIArgumentType, value: string) => {
  const bytes = base64ToBytes(value)
  if (type === ABIReferenceType.asset || type === ABIReferenceType.application || type === ABIReferenceType.account) {
    return new algosdk.ABIUintType(8).decode(bytes)
  }
  const abiType = algosdk.ABIType.from(type.toString())
  return abiType.decode(bytes)
}

const extractReferencedTransactionsFromGroup = (
  transaction: AppCallTransaction | InnerAppCallTransaction,
  group: Group | undefined,
  method: algosdk.ABIMethod
): Transaction[] => {
  if (!group) return []
  const transactionIndexInGroup = group.transactions.findIndex((t) => t.id === transaction.id)
  const transactionTypeArgsCount = method.args.filter((arg) => algosdk.abiTypeIsTransaction(arg.type)).length
  return group.transactions.slice(transactionIndexInGroup - transactionTypeArgsCount, transactionIndexInGroup)
}
