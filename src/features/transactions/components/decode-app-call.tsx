import { RenderLoadable } from '@/features/common/components/render-loadable'
import { AppCallTransaction, InnerAppCallTransaction, Transaction } from '@/features/transactions/models'
import algosdk, { ABIReferenceType } from 'algosdk'
import { Buffer } from 'buffer'
import { Group } from '@/features/groups/models'
import { useLoadableMaybeGroup } from '@/features/groups/data/maybe-group'

type Props = {
  transaction: AppCallTransaction | InnerAppCallTransaction
}

export function DecodeAppCall({ transaction }: Props) {
  const loadableGroup = useLoadableMaybeGroup(transaction.confirmedRound, transaction.group)
  return (
    <RenderLoadable loadable={loadableGroup}>
      {({ group }) => {
        if (transaction.applicationArgs.length === 0) {
          return <span>No application args.</span>
        }
        if (!transaction.abiMethod) {
          return <span>Can't detect, maybe not ARC-32</span>
        }
        return (
          <>
            <span>
              Method name: {transaction.abiMethod.name} <br />
            </span>
            <div>
              Arguments:
              <ul>
                {parseMethodArgs(transaction.abiMethod, transaction, group).map((arg, index) => (
                  <li key={index}>{`${arg}`}</li>
                ))}
              </ul>
            </div>
            <span>
              return value: {parseMethodReturnValue(transaction.abiMethod, transaction)} <br />
            </span>
          </>
        )
      }}
    </RenderLoadable>
  )
}

const parseMethodArgs = (
  method: algosdk.ABIMethod,
  transaction: AppCallTransaction | InnerAppCallTransaction,
  group: Group | undefined
) => {
  // Ignore the first arg, which is the method selector
  const transactionArgs = transaction.applicationArgs.slice(1)
  let transactionArgIndex = 0

  const transactionTypeArgs = extractTransactionTypeArgs(transaction, group, method)
  let transactionTypeArgIndex = 0

  // TODO: link to ARC-4
  const nonTransactionTypeArgs = method.args.filter((arg) => !algosdk.abiTypeIsTransaction(arg.type))
  // TODO: test for transaction arg type
  // TODO: test for reference arg type
  const lastTuple: algosdk.ABIValue[] = []
  if (nonTransactionTypeArgs.length > 15) {
    const argsEncodedInsideTheLastTuple = nonTransactionTypeArgs.slice(14)
    const lastTupleType = new algosdk.ABITupleType(
      argsEncodedInsideTheLastTuple.map((arg) =>
        // if the arg is a reference type, then it is an uint8
        // transaction args were filtered out earlier
        !algosdk.abiTypeIsReference(arg.type) ? (arg.type as algosdk.ABIType) : new algosdk.ABIUintType(8)
      )
    )
    const bytes = convertBase64StringToBytes(transactionArgs[14])
    lastTuple.push(...lastTupleType.decode(bytes))
  }

  return method.args.map((arg) => {
    if (transactionArgIndex === 14 && lastTuple.length > 0) {
      return `${arg.name}: ${lastTuple.shift()}`
    }
    // TODO: test account type, application call type
    if (arg.type === ABIReferenceType.asset) {
      const assetIndex = Number(argToNumber(transactionArgs[transactionArgIndex++], 8))
      return `${arg.name}: ${transaction.foreignAssets[assetIndex]}`
    }
    if (algosdk.abiTypeIsTransaction(arg.type)) {
      const transaction = transactionTypeArgs[transactionTypeArgIndex++]
      return `${arg.name}: ${transaction.id}`
    }

    const abiType = algosdk.ABIType.from(arg.type.toString())
    const bytes = convertBase64StringToBytes(transactionArgs[transactionArgIndex++])
    return `${arg.name}: ${abiType.decode(bytes)}`
  })
}

const parseMethodReturnValue = (method: algosdk.ABIMethod, transaction: AppCallTransaction | InnerAppCallTransaction) => {
  if (method.returns.type === 'void') return undefined
  if (transaction.logs.length === 0) return undefined

  const abiType = algosdk.ABIType.from(method.returns.type.toString())
  // The first 4 bytes are SHA512_256 hash of the string "return"
  const bytes = convertBase64StringToBytes(transaction.logs.slice(-1)[0]).subarray(4)
  return abiType.decode(bytes).toString()
}

const extractTransactionTypeArgs = (
  transaction: AppCallTransaction | InnerAppCallTransaction,
  group: Group | undefined,
  method: algosdk.ABIMethod
): Transaction[] => {
  if (!group) return []
  const transactionIndexInGroup = group.transactions.findIndex((t) => t.id === transaction.id)
  const transactionTypeArgsCount = method.args.filter((arg) => algosdk.abiTypeIsTransaction(arg.type)).length
  return group.transactions.slice(transactionIndexInGroup - transactionTypeArgsCount, transactionIndexInGroup)
}

const convertBase64StringToBytes = (arg: string) => {
  return Uint8Array.from(Buffer.from(arg, 'base64'))
}

const argToNumber = (arg: string, size: number) => {
  const bytes = convertBase64StringToBytes(arg)
  return new algosdk.ABIUintType(size).decode(bytes)
}

// TODO: return value
// const returnValueToString = (returnValue: string) => {
//   const bytes = convertBase64StringToBytes(returnValue)
//   // The first 4 bytes are SHA512_256 hash of the string "return"
//   return new algosdk.ABIStringType().decode(bytes.subarray(4))
// }
