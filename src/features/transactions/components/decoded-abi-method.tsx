import { RenderLoadable } from '@/features/common/components/render-loadable'
import { AppCallTransaction, InnerAppCallTransaction, Transaction } from '@/features/transactions/models'
import algosdk, { ABIReferenceType } from 'algosdk'
import { Buffer } from 'buffer'
import { Group } from '@/features/groups/models'
import { useLoadableMaybeGroup } from '@/features/groups/data/maybe-group'
import { useMemo } from 'react'

type Props = {
  transaction: AppCallTransaction | InnerAppCallTransaction
  abiMethod: algosdk.ABIMethod | undefined
}

export function DecodedAbiMethod({ transaction, abiMethod }: Props) {
  const loadableGroup = useLoadableMaybeGroup(transaction.confirmedRound, transaction.group)
  return (
    <RenderLoadable loadable={loadableGroup}>
      {({ group }) => {
        if (transaction.applicationArgs.length === 0) {
          return <span>No application args.</span>
        }
        if (!abiMethod) {
          return <span>Can't detect, maybe not ARC-32</span>
        }
        return (
          <div className="h-[450px] overflow-x-scroll">
            <span>{abiMethod.name}(</span>
            <div>
              <ul className={'pl-4'}>
                {parseMethodArgs(abiMethod, transaction, group).map((arg, index, arr) => (
                  <li key={index}>
                    {arg}
                    {index < arr.length - 1 ? ', ' : ''}
                  </li>
                ))}
              </ul>
            </div>
            <span>): {parseMethodReturnValue(abiMethod, transaction)}</span>
          </div>
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

  const nonTransactionTypeArgs = method.args.filter((arg) => !algosdk.abiTypeIsTransaction(arg.type))
  // If there are more than 15 args, the args from 15 to the end are encoded inside a tuple
  const argsBeyond15thTuple: algosdk.ABIValue[] = []
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
    argsBeyond15thTuple.push(...lastTupleType.decode(bytes))
  }

  return method.args.map((arg) => {
    if (algosdk.abiTypeIsTransaction(arg.type)) {
      const transaction = transactionTypeArgs[transactionTypeArgIndex++]
      return `${arg.name}: ${transaction.id}`
    }

    const abiValue =
      transactionArgIndex === 14 && argsBeyond15thTuple.length > 0
        ? argsBeyond15thTuple.shift()!
        : getAbiValueForTransactionArg(arg, transactionArgs[transactionArgIndex++])
    return getValueFromABIValue(transaction, arg, abiValue)
  })
}

const getAbiValueForTransactionArg = (arg: algosdk.ABIMethod['args'][0], transactionArg: string) => {
  const bytes = convertBase64StringToBytes(transactionArg)
  if (arg.type === ABIReferenceType.asset || arg.type === ABIReferenceType.application || arg.type === ABIReferenceType.account) {
    return new algosdk.ABIUintType(8).decode(bytes)
  }
  const abiType = algosdk.ABIType.from(arg.type.toString())
  return abiType.decode(bytes)
}

const getValueFromABIValue = (
  transaction: AppCallTransaction | InnerAppCallTransaction,
  arg: algosdk.ABIMethod['args'][0],
  transactionArg: algosdk.ABIValue
) => {
  if (arg.type === ABIReferenceType.asset) {
    return `${arg.name}: ${transaction.foreignAssets[Number(transactionArg)]}`
  }
  if (arg.type === ABIReferenceType.account) {
    const accountIndex = Number(transactionArg)
    // Index 0 of application accounts is the sender
    if (accountIndex === 0) {
      return `${arg.name}: ${transaction.sender}`
    } else {
      return `${arg.name}: ${transaction.applicationAccounts[accountIndex - 1]}`
    }
  }
  if (arg.type === ABIReferenceType.application) {
    const applicationIndex = Number(transactionArg)
    // Index 0 of foreign apps is the called app
    if (applicationIndex === 0) {
      return `${arg.name}: ${transaction.applicationId}`
    } else {
      return `${arg.name}: ${transaction.foreignApps[applicationIndex - 1]}`
    }
  }

  return (
    <>
      {arg.name}: <RenderABITypeValue type={arg.type as algosdk.ABIType} value={transactionArg} />
    </>
  )
}

const parseMethodReturnValue = (method: algosdk.ABIMethod, transaction: AppCallTransaction | InnerAppCallTransaction) => {
  if (method.returns.type === 'void') return 'void'
  if (transaction.logs.length === 0) return 'void'

  const abiType = algosdk.ABIType.from(method.returns.type.toString())
  // The first 4 bytes are SHA512_256 hash of the string "return"
  const bytes = convertBase64StringToBytes(transaction.logs.slice(-1)[0]).subarray(4)
  const returnedValue = abiType.decode(bytes)

  return <RenderABITypeValue type={abiType} value={returnedValue} />
}

const isTupleType = (type: algosdk.ABIType) =>
  type.toString().length > 2 && type.toString().startsWith('(') && type.toString().endsWith(')')

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

type RenderABIArrayValuesProps = {
  type: algosdk.ABIArrayStaticType | algosdk.ABIArrayDynamicType
  values: algosdk.ABIValue[]
}
function RenderABIArrayValues({ type, values }: RenderABIArrayValuesProps) {
  return (
    <>
      <>[</>
      <ul className={'pl-4'}>
        {values.map((value, index, array) => (
          <li key={index}>
            <RenderABITypeValue type={type.childType} value={value} />
            {index < array.length - 1 ? ',' : ''}
          </li>
        ))}
      </ul>
      <>]</>
    </>
  )
}

type RenderABITupleValuesProps = {
  type: algosdk.ABITupleType
  values: algosdk.ABIValue[]
}
function RenderABITupleValues({ type, values }: RenderABITupleValuesProps) {
  return (
    <>
      <>(</>
      <ul className={'pl-4'}>
        {values.map((value, index, array) => (
          <li key={index}>
            <RenderABITypeValue type={type.childTypes[index]} value={value} />
            {index < array.length - 1 ? ',' : ''}
          </li>
        ))}
      </ul>
      <>)</>
    </>
  )
}

type RenderABITypeValueProps = {
  type: algosdk.ABIType
  value: algosdk.ABIValue
}
function RenderABITypeValue({ type, value }: RenderABITypeValueProps) {
  return useMemo(() => {
    if (isTupleType(type)) {
      return <RenderABITupleValues type={type as algosdk.ABITupleType} values={value as algosdk.ABIValue[]} />
    }
    if (isStaticArrayType(type)) {
      return <RenderABIArrayValues type={type as algosdk.ABIArrayStaticType} values={value as algosdk.ABIValue[]} />
    }
    if (isDynamicArrayType(type)) {
      return <RenderABIArrayValues type={type as algosdk.ABIArrayDynamicType} values={value as algosdk.ABIValue[]} />
    }
    if (type.toString() === 'string') {
      return `"${value}"`
    }
    return `${value}`
  }, [type, value])
}

const isStaticArrayType = (type: algosdk.ABIType) => type.toString().endsWith('[]')
const isDynamicArrayType = (type: algosdk.ABIType) => type.toString().endsWith(']')
