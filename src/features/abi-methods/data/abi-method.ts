import { Atom, atom } from 'jotai'
import algosdk, { ABIReferenceType, TransactionType } from 'algosdk'
import { uint8ArrayToBase64 } from '@/utils/uint8-array-to-base64'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { Round } from '@/features/blocks/data/types'
import { AppSpecVersion } from '@/features/app-interfaces/data/types'
import { getGroupResultAtom } from '@/features/groups/data'
import { TransactionId } from '@/features/transactions/data/types'
import { base64ToBytes } from '@/utils/base64-to-bytes'
import { AbiMethod, AbiMethodArgument, AbiMethodReturn, AbiValue, AbiType } from '@/features/abi-methods/models'
import { invariant } from '@/utils/invariant'
import { isArc32AppSpec, isArc4AppSpec } from '@/features/common/utils'
import { createAppInterfaceAtom } from '@/features/app-interfaces/data'
import { sum } from '@/utils/sum'

const MAX_LINE_LENGTH = 20

export const abiMethodResolver = (transaction: TransactionResult): Atom<Promise<AbiMethod | undefined>> => {
  return atom(async (get) => {
    if (!isPossibleAbiAppCallTransaction(transaction)) {
      return undefined
    }

    const abiMethod = await get(createAbiMethodAtom(transaction))
    if (!abiMethod) return undefined

    const methodArguments = await get(createMethodArgumentsAtom(transaction, abiMethod))
    const methodReturn = getMethodReturn(transaction, abiMethod)

    const multiline =
      methodArguments.some((argument) => argument.multiline) || sum(methodArguments.map((arg) => arg.length)) > MAX_LINE_LENGTH

    return {
      name: abiMethod.name,
      arguments: methodArguments,
      return: methodReturn,
      multiline,
    } satisfies AbiMethod
  })
}

const createAbiMethodAtom = (transaction: TransactionResult): Atom<Promise<algosdk.ABIMethod | undefined>> => {
  return atom(async (get) => {
    invariant(transaction['application-transaction'], 'application-transaction is not set')

    const appInterface = await get(createAppInterfaceAtom(transaction['application-transaction']['application-id']))
    if (!appInterface) return undefined

    const appSpecVersion = appInterface.appSpecVersions.find((appSpecVersion) =>
      isValidAppSpecVersion(appSpecVersion, transaction['confirmed-round']!)
    )
    const transactionArgs = transaction['application-transaction']['application-args'] ?? []
    if (transactionArgs.length && appSpecVersion) {
      const methods = isArc32AppSpec(appSpecVersion.appSpec)
        ? appSpecVersion.appSpec.contract.methods
        : isArc4AppSpec(appSpecVersion.appSpec)
          ? appSpecVersion.appSpec.methods
          : undefined
      if (methods) {
        const contractMethod = methods.find((m) => {
          const abiMethod = new algosdk.ABIMethod(m)
          return uint8ArrayToBase64(abiMethod.getSelector()) === transactionArgs[0]
        })
        if (contractMethod) return new algosdk.ABIMethod(contractMethod)
      }
    }
    return undefined
  })
}

const createMethodArgumentsAtom = (transaction: TransactionResult, abiMethod: algosdk.ABIMethod): Atom<Promise<AbiMethodArgument[]>> => {
  return atom(async (get) => {
    invariant(transaction['application-transaction'], 'application-transaction is not set')
    invariant(transaction['application-transaction']?.['application-args'], 'application-transaction application-args is not set')

    const referencedTransactionIds = await get(getReferencedTransactionIdsAtom(transaction, abiMethod))
    const abiValues = getAbiValueArgs(transaction, abiMethod)

    const abiArguments: AbiMethodArgument[] = abiMethod.args.map((argumentSpec, index) => {
      const argName = argumentSpec.name ?? `arg${index}`

      if (algosdk.abiTypeIsTransaction(argumentSpec.type)) {
        const transactionId = referencedTransactionIds.shift()!
        return {
          name: argName,
          type: AbiType.Transaction,
          value: transactionId,
          multiline: false,
          length: transactionId.length,
        }
      }

      const abiValue = abiValues.shift()!

      if (argumentSpec.type === ABIReferenceType.asset) {
        invariant(transaction['application-transaction']?.['foreign-assets'], 'application-transaction foreign-assets is not set')
        const assetId = transaction['application-transaction']['foreign-assets'][Number(abiValue)]
        return {
          name: argName,
          type: AbiType.Asset,
          value: assetId,
          multiline: false,
          length: assetId.toString().length,
        }
      }
      if (argumentSpec.type === ABIReferenceType.account) {
        invariant(transaction['application-transaction']?.['accounts'], 'application-transaction accounts is not set')

        // Index 0 of application accounts is the sender
        const accountIndex = Number(abiValue)
        const accountAddress =
          accountIndex === 0 ? transaction.sender : transaction['application-transaction']['accounts'][accountIndex - 1]
        return {
          name: argName,
          type: AbiType.Account,
          value: accountAddress,
          multiline: false,
          length: accountAddress.length,
        }
      }
      if (argumentSpec.type === ABIReferenceType.application) {
        invariant(transaction['application-transaction']?.['foreign-apps'], 'application-transaction foreign-apps is not set')

        // Index 0 of foreign apps is the called app
        const applicationIndex = Number(abiValue)
        const applicationId =
          applicationIndex === 0 ? transaction.applicationId : transaction['application-transaction']['foreign-apps'][applicationIndex - 1]
        return {
          name: argName,
          type: AbiType.Application,
          value: applicationId,
          multiline: false,
          length: applicationId.toString().length,
        }
      }

      return {
        name: argName,
        ...getAbiValue(argumentSpec.type, abiValue),
      }
    })

    return abiArguments
  })
}

const getMethodReturn = (transaction: TransactionResult, abiMethod: algosdk.ABIMethod): AbiMethodReturn => {
  if (abiMethod.returns.type === 'void') return 'void'
  invariant(transaction.logs && transaction.logs.length > 0, 'transaction logs is not set')

  const abiType = algosdk.ABIType.from(abiMethod.returns.type.toString())
  // The first 4 bytes are SHA512_256 hash of the string "return"
  const bytes = base64ToBytes(transaction.logs.slice(-1)[0]).subarray(4)
  const abiValue = abiType.decode(bytes)
  return getAbiValue(abiType, abiValue)
}

const getAbiValue = (abiType: algosdk.ABIType, abiValue: algosdk.ABIValue): AbiValue => {
  if (abiType instanceof algosdk.ABITupleType) {
    const childTypes = abiType.childTypes
    const abiValues = abiValue as algosdk.ABIValue[]
    if (childTypes.length !== abiValues.length) {
      throw new Error('Tuple type has different number of child types than abi values')
    }

    const childrenValues = abiValues.map((abiValue, index) => getAbiValue(childTypes[index], abiValue))
    const length = sum(childrenValues.map((v) => v.length))
    const multiline = childrenValues.some((v) => v.multiline) || length > MAX_LINE_LENGTH

    return {
      type: AbiType.Tuple,
      values: childrenValues,
      multiline,
      length,
    }
  }
  if (abiType instanceof algosdk.ABIArrayStaticType || abiType instanceof algosdk.ABIArrayDynamicType) {
    const childType = abiType.childType
    if (childType instanceof algosdk.ABIByteType) {
      // Treat bytes arrays as strings
      const base64Value = uint8ArrayToBase64(abiValue as Uint8Array)
      return {
        type: AbiType.String,
        value: base64Value,
        multiline: false,
        length: base64Value.length,
      }
    } else {
      const abiValues = abiValue as algosdk.ABIValue[]
      const childrenValues = abiValues.map((abiValue) => getAbiValue(childType, abiValue))
      const length = sum(childrenValues.map((v) => v.length))
      const multiline = childrenValues.some((v) => v.multiline) || length > MAX_LINE_LENGTH

      return {
        type: AbiType.Array,
        values: childrenValues,
        multiline,
        length,
      }
    }
  }
  if (abiType instanceof algosdk.ABIStringType) {
    const stringValue = abiValue as string
    return {
      type: AbiType.String,
      value: stringValue,
      length: stringValue.length,
      multiline: false,
    }
  }
  if (abiType instanceof algosdk.ABIAddressType) {
    const stringValue = abiValue as string
    return {
      type: AbiType.Address,
      value: stringValue,
      length: stringValue.length,
      multiline: false,
    }
  }
  if (abiType instanceof algosdk.ABIBoolType) {
    const boolValue = abiValue as boolean
    return {
      type: AbiType.Boolean,
      value: boolValue,
      length: boolValue.toString().length,
      multiline: false,
    }
  }
  if (abiType instanceof algosdk.ABIUintType) {
    const bigintValue = abiValue as bigint
    return {
      type: AbiType.Uint,
      value: bigintValue,
      length: bigintValue.toString().length,
      multiline: false,
    }
  }
  if (abiType instanceof algosdk.ABIUfixedType) {
    const stringValue = bigintToString(abiValue as bigint, abiType.precision)
    return {
      type: AbiType.Ufixed,
      value: stringValue,
      length: stringValue.length,
      multiline: false,
    }
  }
  if (abiType instanceof algosdk.ABIByteType) {
    const numberValue = abiValue as number
    return {
      type: AbiType.Byte,
      value: numberValue,
      length: numberValue.toString().length,
      multiline: false,
    }
  }

  throw new Error(`Unknown type ${abiType}`)
}

const isPossibleAbiAppCallTransaction = (transaction: TransactionResult): boolean => {
  return (
    transaction['tx-type'] === TransactionType.appl &&
    transaction['application-transaction'] !== undefined &&
    transaction['confirmed-round'] !== undefined &&
    Boolean(transaction['application-transaction']['application-id']) &&
    transaction['application-transaction']['application-args'] !== undefined &&
    transaction['application-transaction']['application-args'].length > 0 &&
    base64ToBytes(transaction['application-transaction']['application-args'][0]).length === 4
  )
}

const getReferencedTransactionIdsAtom = (transaction: TransactionResult, abiMethod: algosdk.ABIMethod): Atom<Promise<TransactionId[]>> => {
  return atom(async (get) => {
    const hasReferencedTransactions = abiMethod.args.some((arg) => algosdk.abiTypeIsTransaction(arg.type))
    if (!hasReferencedTransactions) return []

    invariant(transaction['confirmed-round'] && transaction['group'], 'Cannot get referenced transactions without a group')

    const groupResult = await get(getGroupResultAtom(transaction['group'], transaction['confirmed-round']))
    const transactionIndexInGroup = groupResult.transactionIds.findIndex((id) => id === transaction.id)
    const transactionTypeArgsCount = abiMethod.args.filter((arg) => algosdk.abiTypeIsTransaction(arg.type)).length
    return groupResult.transactionIds.slice(transactionIndexInGroup - transactionTypeArgsCount, transactionIndexInGroup)
  })
}

const getAbiValueArgs = (transaction: TransactionResult, abiMethod: algosdk.ABIMethod): algosdk.ABIValue[] => {
  invariant(transaction['application-transaction'], 'application-transaction is not set')
  invariant(transaction['application-transaction']?.['application-args'], 'application-transaction application-args is not set')

  // The first arg is the method selector
  const transactionArgs = transaction['application-transaction']['application-args'].slice(1)
  const nonTransactionTypeArgs = abiMethod.args.filter((arg) => !algosdk.abiTypeIsTransaction(arg.type))

  // If there are more than 15 args, the args from 15 to the end are encoded inside a tuple
  if (nonTransactionTypeArgs.length > 15) {
    const [head, tail] = [nonTransactionTypeArgs.slice(0, 14), nonTransactionTypeArgs.slice(14)]
    const results: algosdk.ABIValue[] = head.map((argumentSpec, index) =>
      mapAbiArgumentToAbiValue(argumentSpec.type, transactionArgs[index])
    )

    const tupleType = new algosdk.ABITupleType(
      tail.map((arg) =>
        // if the arg is a reference type, then it is an uint8
        !algosdk.abiTypeIsReference(arg.type) ? (arg.type as algosdk.ABIType) : new algosdk.ABIUintType(8)
      )
    )

    const bytes = base64ToBytes(transactionArgs[14])
    results.push(...tupleType.decode(bytes))

    return results
  } else {
    return nonTransactionTypeArgs.map((argumentSpec, index) => mapAbiArgumentToAbiValue(argumentSpec.type, transactionArgs[index]))
  }
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
  const roundFirstValid = appSpec.roundLastValid ?? -1
  const roundLastValid = appSpec.roundLastValid ?? Number.MAX_SAFE_INTEGER
  return roundFirstValid <= round && round <= roundLastValid
}

const bigintToString = (value: bigint, decimalScale: number): string => {
  const valueString = value.toString()
  const numberString = valueString.slice(0, valueString.length - decimalScale)
  const fractionString = valueString.slice(valueString.length - decimalScale)
  return `${numberString}.${fractionString}`
}
