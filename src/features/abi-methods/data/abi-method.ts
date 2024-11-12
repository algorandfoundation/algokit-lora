import { Atom, atom } from 'jotai'
import algosdk, { ABIReferenceType, TransactionType } from 'algosdk'
import { uint8ArrayToBase64 } from '@/utils/uint8-array-to-base64'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { Round } from '@/features/blocks/data/types'
import { AppSpecVersion } from '@/features/app-interfaces/data/types'
import { TransactionId } from '@/features/transactions/data/types'
import { base64ToBytes } from '@/utils/base64-to-bytes'
import { invariant } from '@/utils/invariant'
import { createAppInterfaceAtom } from '@/features/app-interfaces/data'
import { sum } from '@/utils/sum'
import { GroupId, GroupResult } from '@/features/groups/data/types'
import { AsyncMaybeAtom } from '@/features/common/data/types'
import { MethodDefinition, StructDefinition, StructFieldDefinition } from '@/features/applications/models'
import { asMethodDefinitions } from '@/features/applications/mappers'
import {
  DecodedAbiMethod,
  DecodedAbiMethodArgument,
  DecodedAbiMethodReturn,
  DecodedAbiStruct,
  DecodedAbiStructField,
  DecodedAbiType,
  DecodedAbiValue,
} from '@/features/abi-methods/models'
import { bigIntToFixedPointDecimalString } from '../mappers'
import { getLatestAppSpecVersion } from '@/features/app-interfaces/mappers'

const MAX_LINE_LENGTH = 20

export const abiMethodResolver = (
  transaction: TransactionResult,
  groupResolver: (groupId: GroupId, round: Round) => AsyncMaybeAtom<GroupResult>
): Atom<Promise<DecodedAbiMethod | undefined>> => {
  return atom(async (get) => {
    if (!isPossibleAbiAppCallTransaction(transaction)) {
      return undefined
    }

    const methodDefinition = await get(createMethodDefinitionAtom(transaction))
    if (!methodDefinition) return undefined

    const methodArguments = await get(createMethodArgumentsAtom(transaction, methodDefinition, groupResolver))
    const methodReturn = getMethodReturn(transaction, methodDefinition)

    const multiline =
      methodArguments.some((argument) => argument.multiline) || sum(methodArguments.map((arg) => arg.length)) > MAX_LINE_LENGTH

    return {
      name: methodDefinition.abiMethod.name,
      arguments: methodArguments,
      return: methodReturn,
      multiline,
    } satisfies DecodedAbiMethod
  })
}

const createMethodDefinitionAtom = (transaction: TransactionResult): Atom<Promise<MethodDefinition | undefined>> => {
  return atom(async (get) => {
    invariant(transaction['application-transaction'], 'application-transaction is not set')

    const appInterface = await get(createAppInterfaceAtom(transaction['application-transaction']['application-id']))
    if (!appInterface) return undefined

    const appSpecVersion = transaction['confirmed-round']
      ? appInterface.appSpecVersions.find((appSpecVersion) => isValidAppSpecVersion(appSpecVersion, transaction['confirmed-round']!))
      : getLatestAppSpecVersion(appInterface.appSpecVersions)
    const transactionArgs = transaction['application-transaction']['application-args'] ?? []
    if (transactionArgs.length && appSpecVersion) {
      const methods = asMethodDefinitions(appSpecVersion.appSpec)
      return methods.find((m) => {
        return uint8ArrayToBase64(m.abiMethod.getSelector()) === transactionArgs[0]
      })
    }
    return undefined
  })
}

const createMethodArgumentsAtom = (
  transaction: TransactionResult,
  methodDefinition: MethodDefinition,
  groupResolver: (groupId: GroupId, round: Round) => AsyncMaybeAtom<GroupResult>
): Atom<Promise<DecodedAbiMethodArgument[]>> => {
  return atom(async (get) => {
    invariant(transaction['application-transaction'], 'application-transaction is not set')
    invariant(transaction['application-transaction']?.['application-args'], 'application-transaction application-args is not set')

    const referencedTransactionIds = await get(getReferencedTransactionIdsAtom(transaction, methodDefinition.abiMethod, groupResolver))
    const abiValues = getAbiValueArgs(transaction, methodDefinition.abiMethod)

    const abiArguments: DecodedAbiMethodArgument[] = methodDefinition.arguments.map((argumentDefinition, index) => {
      const argName = argumentDefinition.name ?? `arg${index}`

      if (algosdk.abiTypeIsTransaction(argumentDefinition.type)) {
        const transactionId = referencedTransactionIds.shift()!
        return {
          name: argName,
          type: DecodedAbiType.Transaction,
          value: transactionId,
          multiline: false,
          length: transactionId.length,
        }
      }

      const abiValue = abiValues.shift()!

      if (argumentDefinition.type === ABIReferenceType.asset) {
        invariant(transaction['application-transaction']?.['foreign-assets'], 'application-transaction foreign-assets is not set')
        const assetId = transaction['application-transaction']['foreign-assets'][Number(abiValue)]
        return {
          name: argName,
          type: DecodedAbiType.Asset,
          value: assetId,
          multiline: false,
          length: assetId.toString().length,
        }
      }
      if (argumentDefinition.type === ABIReferenceType.account) {
        invariant(transaction['application-transaction']?.['accounts'], 'application-transaction accounts is not set')

        // Index 0 of application accounts is the sender
        const accountIndex = Number(abiValue)
        const accountAddress =
          accountIndex === 0 ? transaction.sender : transaction['application-transaction']['accounts'][accountIndex - 1]
        return {
          name: argName,
          type: DecodedAbiType.Account,
          value: accountAddress,
          multiline: false,
          length: accountAddress.length,
        }
      }
      if (argumentDefinition.type === ABIReferenceType.application) {
        invariant(transaction['application-transaction']?.['foreign-apps'], 'application-transaction foreign-apps is not set')

        // Index 0 of foreign apps is the called app
        const applicationIndex = Number(abiValue)
        const applicationId =
          applicationIndex === 0 ? transaction.applicationId : transaction['application-transaction']['foreign-apps'][applicationIndex - 1]
        return {
          name: argName,
          type: DecodedAbiType.Application,
          value: applicationId,
          multiline: false,
          length: applicationId.toString().length,
        }
      }

      if (argumentDefinition.struct) {
        return {
          name: argName,
          ...getAbiStructValue(argumentDefinition.struct, abiValue),
        }
      }

      return {
        name: argName,
        ...getAbiValue(argumentDefinition.type, abiValue),
      }
    })

    return abiArguments
  })
}

const getMethodReturn = (transaction: TransactionResult, methodDefinition: MethodDefinition): DecodedAbiMethodReturn => {
  if (methodDefinition.returns.type === 'void') return 'void'
  invariant(transaction.logs && transaction.logs.length > 0, 'transaction logs is not set')

  const abiType = algosdk.ABIType.from(methodDefinition.returns.type.toString())
  // The first 4 bytes are SHA512_256 hash of the string "return"
  const bytes = base64ToBytes(transaction.logs.slice(-1)[0]).subarray(4)
  const abiValue = abiType.decode(bytes)

  if (methodDefinition.returns.struct) {
    return getAbiStructValue(methodDefinition.returns.struct, abiValue)
  } else {
    return getAbiValue(abiType, abiValue)
  }
}

export const getAbiStructValue = (struct: StructDefinition, abiValue: algosdk.ABIValue): DecodedAbiStruct => {
  const decodeStructField = (field: StructFieldDefinition, abiValue: algosdk.ABIValue): DecodedAbiStructField => {
    if (Array.isArray(field.type)) {
      const valueAsArray = abiValue as algosdk.ABIValue[]
      const childrenFields = field.type.map((childField, index) => {
        return decodeStructField(childField, valueAsArray[index])
      })
      return {
        name: field.name,
        value: childrenFields,
        length: sum(childrenFields.map((v) => `${v.name}: ${v.value}`.length)),
        multiline: childrenFields.some((v) => v.multiline),
      }
    } else {
      const decodedValue = getAbiValue(field.type, abiValue)
      return {
        name: field.name,
        value: decodedValue,
        length: `${field.name.length}: ${decodedValue.length}`.length,
        multiline: decodedValue.multiline,
      }
    }
  }

  const abiValues = abiValue as algosdk.ABIValue[]
  const fields = struct.fields.map((structField, index) => {
    return decodeStructField(structField, abiValues[index])
  })
  const length = sum(fields.map((v) => `${v.name}: ${v.value}`.length))
  const multiline = fields.some((v) => v.multiline) || length > MAX_LINE_LENGTH

  return {
    type: DecodedAbiType.Struct,
    fields: fields,
    multiline: multiline,
    length: length,
  }
}

export const getAbiValue = (abiType: algosdk.ABIType, abiValue: algosdk.ABIValue): DecodedAbiValue => {
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
      type: DecodedAbiType.Tuple,
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
        type: DecodedAbiType.String,
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
        type: DecodedAbiType.Array,
        values: childrenValues,
        multiline,
        length,
      }
    }
  }
  if (abiType instanceof algosdk.ABIStringType) {
    const stringValue = abiValue as string
    return {
      type: DecodedAbiType.String,
      value: stringValue,
      length: stringValue.length,
      multiline: false,
    }
  }
  if (abiType instanceof algosdk.ABIAddressType) {
    const stringValue = abiValue as string
    return {
      type: DecodedAbiType.Address,
      value: stringValue,
      length: stringValue.length,
      multiline: false,
    }
  }
  if (abiType instanceof algosdk.ABIBoolType) {
    const boolValue = abiValue as boolean
    return {
      type: DecodedAbiType.Boolean,
      value: boolValue,
      length: boolValue.toString().length,
      multiline: false,
    }
  }
  if (abiType instanceof algosdk.ABIUintType) {
    const bigintValue = abiValue as bigint
    return {
      type: DecodedAbiType.Uint,
      value: bigintValue,
      length: bigintValue.toString().length,
      multiline: false,
    }
  }
  if (abiType instanceof algosdk.ABIUfixedType) {
    const stringValue = bigIntToFixedPointDecimalString(abiValue as bigint, abiType.precision)
    return {
      type: DecodedAbiType.Ufixed,
      value: stringValue,
      length: stringValue.length,
      multiline: false,
    }
  }
  if (abiType instanceof algosdk.ABIByteType) {
    const numberValue = abiValue as number
    return {
      type: DecodedAbiType.Byte,
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

const getReferencedTransactionIdsAtom = (
  transaction: TransactionResult,
  abiMethod: algosdk.ABIMethod,
  groupResolver: (groupId: GroupId, round: Round) => AsyncMaybeAtom<GroupResult>
): Atom<Promise<TransactionId[]>> => {
  return atom(async (get) => {
    const hasReferencedTransactions = abiMethod.args.some((arg) => algosdk.abiTypeIsTransaction(arg.type))
    if (!hasReferencedTransactions) {
      return []
    }

    invariant(transaction['confirmed-round'] !== undefined && transaction['group'], 'Cannot get referenced transactions without a group')

    const group = await get(groupResolver(transaction['group'], transaction['confirmed-round']))
    const transactionIndexInGroup = group.transactionIds.findIndex((id) => id === transaction.id)
    const transactionTypeArgsCount = abiMethod.args.filter((arg) => algosdk.abiTypeIsTransaction(arg.type)).length
    return group.transactionIds.slice(transactionIndexInGroup - transactionTypeArgsCount, transactionIndexInGroup)
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
  const roundFirstValid = appSpec.roundFirstValid ?? -1
  const roundLastValid = appSpec.roundLastValid ?? Number.MAX_SAFE_INTEGER
  return roundFirstValid <= round && round <= roundLastValid
}
