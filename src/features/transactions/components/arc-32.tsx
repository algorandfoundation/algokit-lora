import { RenderLoadable } from '@/features/common/components/render-loadable'
import { AppCallTransaction, InnerAppCallTransaction, Transaction } from '@/features/transactions/models'
import algosdk, { ABIReferenceType } from 'algosdk'
import { Buffer } from 'buffer'
import { useLoadableArc32Data } from '@/features/transactions/data/arc-32'
import { Group } from '@/features/groups/models'
import { uint8ArrayToBase64 } from '@/utils/uint8-array-to-base64'

type Props = {
  transaction: AppCallTransaction | InnerAppCallTransaction
}

export function Arc32({ transaction }: Props) {
  const loadableArc32Data = useLoadableArc32Data(transaction)
  return (
    <RenderLoadable loadable={loadableArc32Data}>
      {({ group, application }) => {
        if (transaction.applicationArgs.length === 0) {
          return <span>No application args.</span>
        }
        const method = application.methods.find((m) => uint8ArrayToBase64(m.getSelector()) === transaction.applicationArgs[0])
        if (!method) {
          return <span>Can't detect, maybe not ARC-32</span>
        }
        return (
          <>
            <span>
              Method name: {method.name} <br />
            </span>
            <div>
              Arguments:
              <ul>
                {parseMethodArgs(method, transaction, group).map((arg, index) => (
                  <li key={index}>{`${arg}`}</li>
                ))}
              </ul>
            </div>
            {/*<span>*/}
            {/*  return value: {decodeReturnValueToString(transaction.logs[0])} <br />*/}
            {/*</span>*/}
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
  const args = transaction.applicationArgs.slice(1)
  let argIndex = 0

  const transactionArgs = extractTransactionTypeArgs(transaction, group, method)
  let transactionArgIndex = 0

  return method.args.map((arg) => {
    if (arg.type.toString() === 'string') {
      return argToString(args[argIndex++])
    }
    if (arg.type.toString().startsWith('uint')) {
      const bitSize = parseInt(arg.type.toString().slice(4))
      return argToNumber(args[argIndex++], bitSize)
    }
    if (arg.type === ABIReferenceType.asset) {
      const assetIndex = Number(argToNumber(args[argIndex++], 8))
      return `Asset ID: ${transaction.foreignAssets[assetIndex]}`
    }
    if (algosdk.abiTypeIsTransaction(arg.type)) {
      return `Transaction ID: ${transactionArgs[transactionArgIndex++].id}`
    }
  })
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

const argToString = (arg: string) => {
  const bytes = convertBase64StringToBytes(arg)
  return new algosdk.ABIStringType().decode(bytes)
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
