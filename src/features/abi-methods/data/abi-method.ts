import { Atom, atom } from 'jotai'
import { applicationsAppSpecsAtom } from '@/features/abi-methods/data/index'
import algosdk, { ABIReferenceType, TransactionType } from 'algosdk'
import { uint8ArrayToBase64 } from '@/utils/uint8-array-to-base64'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { Round } from '@/features/blocks/data/types'
import { AppSpecVersion } from '@/features/abi-methods/data/types'
import { getGroupResultAtom } from '@/features/groups/data'
import { TransactionId } from '@/features/transactions/data/types'
import { base64ToBytes } from '@/utils/base64-to-bytes'
import { AbiMethod, AbiMethodArgument, AbiMethodReturn, AbiPrimitiveValue, AbiValueType } from '@/features/abi-methods/models'

// TODO: ARC-32 has network info, do we need to check it?
export const abiMethodResolver = (transaction: TransactionResult): Atom<Promise<AbiMethod | undefined>> => {
  return atom(async (get) => {
    if (
      transaction['tx-type'] !== TransactionType.appl ||
      !transaction['application-transaction'] ||
      !transaction['confirmed-round'] ||
      !transaction['application-transaction']['application-args']
    ) {
      return undefined
    }

    const abiMethod = await get(getAbiMethodAtom(transaction))
    if (!abiMethod) return undefined

    const methodArguments = await get(getMethodArgumentsAtom(transaction, abiMethod))
    const methodReturn = getMethodReturn(transaction, abiMethod)

    return {
      name: abiMethod.name,
      arguments: methodArguments,
      return: methodReturn,
    } satisfies AbiMethod
  })
}

const getAbiMethodAtom = (transaction: TransactionResult): Atom<Promise<algosdk.ABIMethod | undefined>> => {
  return atom(async (get) => {
    if (transaction['tx-type'] !== TransactionType.appl || !transaction['application-transaction'] || !transaction['confirmed-round']) {
      return undefined
    }

    const applicationAppSpecs = await get(applicationsAppSpecsAtom(transaction['application-transaction']['application-id']))
    const appSpecVersion = applicationAppSpecs?.appSpecVersions.find((appSpecVersion) =>
      isValidAppSpecVersion(appSpecVersion, transaction['confirmed-round']!)
    )
    const transactionArgs = transaction['application-transaction']['application-args'] ?? []
    if (transactionArgs.length && appSpecVersion) {
      const methodContract = appSpecVersion.appSpec.contract.methods.find((m) => {
        const abiMethod = new algosdk.ABIMethod(m)
        return uint8ArrayToBase64(abiMethod.getSelector()) === transactionArgs[0]
      })
      if (methodContract) return new algosdk.ABIMethod(methodContract)
    }

    return undefined
  })
}

const getMethodArgumentsAtom = (transaction: TransactionResult, abiMethod: algosdk.ABIMethod): Atom<Promise<AbiMethodArgument[]>> => {
  return atom(async (get) => {
    if (!isValidAppCallTransaction(transaction)) {
      throw new Error('Cannot get method arguments without a valid app call transaction')
    }
    if (transaction['application-transaction']!['application-args']!.length === 0) {
      return []
    }

    const transactionArgs = transaction['application-transaction']!['application-args']!.slice(1)
    let transactionArgIndex = 0
    const referencedTransactionIds = await get(getReferencedTransactionIdsAtom(transaction, abiMethod))
    // If there are more than 15 args, the args from 15 to the end are encoded inside a tuple
    const argValuesBeyondIndex15th = getArgValuesBeyondIndex15th(transaction, abiMethod)

    const abiArguments: AbiMethodArgument[] = abiMethod.args.map((argumentSpec) => {
      if (algosdk.abiTypeIsTransaction(argumentSpec.type)) {
        return {
          name: argumentSpec.name!,
          type: AbiValueType.Transaction,
          value: referencedTransactionIds.shift()!,
        }
      }

      const argName = argumentSpec.name!
      const abiValue =
        transactionArgIndex === 14 && argValuesBeyondIndex15th.length > 0
          ? argValuesBeyondIndex15th.shift()!
          : mapAbiArgumentToAbiValue(argumentSpec.type, transactionArgs[transactionArgIndex++])

      if (argumentSpec.type === ABIReferenceType.asset) {
        return {
          name: argName,
          type: AbiValueType.Asset,
          value: transaction['application-transaction']!['foreign-assets']![Number(abiValue)],
        }
      }
      if (argumentSpec.type === ABIReferenceType.account) {
        const accountIndex = Number(abiValue)
        // Index 0 of application accounts is the sender
        return {
          name: argName,
          type: AbiValueType.Account,
          value: accountIndex === 0 ? transaction.sender : transaction['application-transaction']!['accounts']![accountIndex - 1],
        }
      }
      if (argumentSpec.type === ABIReferenceType.application) {
        const applicationIndex = Number(abiValue)
        // Index 0 of foreign apps is the called app
        return {
          name: argName,
          type: AbiValueType.Application,
          value:
            applicationIndex === 0
              ? transaction.applicationId
              : transaction['application-transaction']!['foreign-apps']![applicationIndex - 1],
        }
      }

      return {
        name: argName,
        ...getAbiPrimitiveValue(argumentSpec.type, abiValue),
      }
    })

    return abiArguments
  })
}

const getMethodReturn = (transaction: TransactionResult, abiMethod: algosdk.ABIMethod): AbiMethodReturn => {
  if (abiMethod.returns.type === 'void') return 'void'
  if (!transaction['logs'] || transaction['logs'].length === 0) return 'void'

  const abiType = algosdk.ABIType.from(abiMethod.returns.type.toString())
  // The first 4 bytes are SHA512_256 hash of the string "return"
  const bytes = base64ToBytes(transaction.logs.slice(-1)[0]).subarray(4)
  const abiValue = abiType.decode(bytes)
  return getAbiPrimitiveValue(abiType, abiValue)
}

const getAbiPrimitiveValue = (abiType: algosdk.ABIType, abiValue: algosdk.ABIValue): AbiPrimitiveValue => {
  if (isTupleType(abiType)) {
    const childTypes = (abiType as algosdk.ABITupleType).childTypes
    const abiValues = abiValue as algosdk.ABIValue[]
    if (childTypes.length !== abiValues.length) {
      throw new Error('Tuple type has different number of child types than abi values')
    }

    return {
      type: AbiValueType.Tuple,
      value: abiValues.map((abiValue, index) => getAbiPrimitiveValue(childTypes[index], abiValue)),
    }
  }
  if (isStaticArrayType(abiType)) {
    const childType = (abiType as algosdk.ABIArrayStaticType).childType
    const abiValues = abiValue as algosdk.ABIValue[]
    return {
      type: AbiValueType.Array,
      value: abiValues.map((abiValue) => getAbiPrimitiveValue(childType, abiValue)),
    }
  }
  if (isDynamicArrayType(abiType)) {
    const childType = (abiType as algosdk.ABIArrayDynamicType).childType
    const abiValues = abiValue as algosdk.ABIValue[]
    return {
      type: AbiValueType.Array,
      value: abiValues.map((abiValue) => getAbiPrimitiveValue(childType, abiValue)),
    }
  }
  if (abiType.toString() === 'string') {
    return {
      type: AbiValueType.String,
      value: abiValue as string,
    }
  }
  if (abiType.toString() === 'address') {
    return {
      type: AbiValueType.Address,
      value: abiValue as string,
    }
  }
  if (abiType.toString() === 'bool') {
    return {
      type: AbiValueType.Boolean,
      value: abiValue as boolean,
    }
  }
  // For the rest, we treat as number
  return {
    type: AbiValueType.Number,
    value: Number(abiValue),
  }
}

const isValidAppCallTransaction = (transaction: TransactionResult): boolean => {
  return (
    transaction['tx-type'] === TransactionType.appl &&
    Boolean(transaction['application-transaction']) &&
    Boolean(transaction['confirmed-round']) &&
    Boolean(transaction['application-transaction']?.['application-args'])
  )
}

const getReferencedTransactionIdsAtom = (transaction: TransactionResult, abiMethod: algosdk.ABIMethod): Atom<Promise<TransactionId[]>> => {
  return atom(async (get) => {
    const hasReferencedTransactions = abiMethod.args.some((arg) => algosdk.abiTypeIsTransaction(arg.type))
    if (!hasReferencedTransactions) return []

    if (hasReferencedTransactions && !transaction['confirmed-round'] && !transaction['group']) {
      throw new Error('Cannot get referenced transactions without a group')
    }

    const groupResult = await get(getGroupResultAtom(transaction['group']!, transaction['confirmed-round']!))

    const transactionIndexInGroup = groupResult.transactionIds.findIndex((id) => id === transaction.id)
    const transactionTypeArgsCount = abiMethod.args.filter((arg) => algosdk.abiTypeIsTransaction(arg.type)).length
    return groupResult.transactionIds.slice(transactionIndexInGroup - transactionTypeArgsCount, transactionIndexInGroup)
  })
}

const getArgValuesBeyondIndex15th = (transaction: TransactionResult, abiMethod: algosdk.ABIMethod): algosdk.ABIValue[] => {
  if (
    transaction['tx-type'] !== TransactionType.appl ||
    !transaction['application-transaction'] ||
    !transaction['confirmed-round'] ||
    !transaction['application-transaction']['application-args'] ||
    transaction['application-transaction']['application-args'].length < 15
  ) {
    return []
  }

  const transactionArgs = transaction['application-transaction']['application-args']
  const nonTransactionTypeArgs = abiMethod.args.filter((arg) => !algosdk.abiTypeIsTransaction(arg.type))

  const results: algosdk.ABIValue[] = []
  if (nonTransactionTypeArgs.length > 15) {
    const argsEncodedInsideTheLastTuple = nonTransactionTypeArgs.slice(14)
    const lastTupleType = new algosdk.ABITupleType(
      argsEncodedInsideTheLastTuple.map((arg) =>
        // if the arg is a reference type, then it is an uint8
        !algosdk.abiTypeIsReference(arg.type) ? (arg.type as algosdk.ABIType) : new algosdk.ABIUintType(8)
      )
    )
    const bytes = base64ToBytes(transactionArgs[14])
    results.push(...lastTupleType.decode(bytes))
  }
  return results
}

const mapAbiArgumentToAbiValue = (type: algosdk.ABIArgumentType, value: string) => {
  const bytes = base64ToBytes(value)
  if (type === ABIReferenceType.asset || type === ABIReferenceType.application || type === ABIReferenceType.account) {
    return new algosdk.ABIUintType(8).decode(bytes)
  }
  const abiType = algosdk.ABIType.from(type.toString())
  return abiType.decode(bytes)
}

const isValidAppSpecVersion = (appSpec: AppSpecVersion, round: Round) => {
  const validFromRound = appSpec.validUntilRound ?? -1
  const validToRound = appSpec.validUntilRound ?? Number.MAX_SAFE_INTEGER
  return validFromRound <= round && round <= validToRound
}

const isTupleType = (type: algosdk.ABIType) =>
  type.toString().length > 2 && type.toString().startsWith('(') && type.toString().endsWith(')')
const isStaticArrayType = (type: algosdk.ABIType) => type.toString().endsWith('[]')
const isDynamicArrayType = (type: algosdk.ABIType) => type.toString().endsWith(']')
