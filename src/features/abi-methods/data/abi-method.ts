import { Atom, atom } from 'jotai'
import algosdk, { ABIReferenceType, TransactionType } from 'algosdk'
import { Round } from '@/features/blocks/data/types'
import { AppSpecVersion } from '@/features/app-interfaces/data/types'
import { TransactionId, TransactionResult } from '@/features/transactions/data/types'
import { invariant } from '@/utils/invariant'
import { createAppInterfaceAtom } from '@/features/app-interfaces/data'
import { sum } from '@/utils/sum'
import { GroupId, GroupResult } from '@/features/groups/data/types'
import { AsyncMaybeAtom } from '@/features/common/data/types'
import { MethodDefinition } from '@/features/applications/models'
import { asMethodDefinitions } from '@/features/applications/mappers'
import { DecodedAbiMethod, DecodedAbiMethodArgument, DecodedAbiMethodReturn, DecodedAbiType } from '@/features/abi-methods/models'
import { asDecodedAbiStruct, asDecodedAbiValue } from '../mappers'
import { getLatestAppSpecVersion } from '@/features/app-interfaces/mappers'
import { uint8ArrayToBase64 } from '@/utils/uint8-array-to-base64'

const MAX_LINE_LENGTH = 20

export const abiMethodResolver = (
  transaction: TransactionResult,
  groupResolver: (groupId: GroupId, round: Round) => AsyncMaybeAtom<GroupResult>
): Atom<Promise<DecodedAbiMethod | undefined>> => {
  return atom(async (get) => {
    if (!isPossibleAbiAppCallTransaction(transaction)) {
      return undefined
    }

    try {
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
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error decoding ABI method', error)
      return undefined
    }
  })
}

const createMethodDefinitionAtom = (transaction: TransactionResult): Atom<Promise<MethodDefinition | undefined>> => {
  return atom(async (get) => {
    invariant(transaction.applicationTransaction, 'application-transaction is not set')

    const appInterface = await get(createAppInterfaceAtom(transaction.applicationTransaction.applicationId!))
    if (!appInterface) return undefined

    const appSpecVersion = transaction.confirmedRound
      ? appInterface.appSpecVersions.find((appSpecVersion) => isValidAppSpecVersion(appSpecVersion, transaction.confirmedRound!))
      : getLatestAppSpecVersion(appInterface.appSpecVersions)
    const transactionArgs = transaction.applicationTransaction!.applicationArgs ?? []
    if (transactionArgs.length && appSpecVersion) {
      const methods = asMethodDefinitions(appSpecVersion.appSpec)
      return methods.find((m) => {
        return uint8ArrayToBase64(m.abiMethod.getSelector()) === uint8ArrayToBase64(transactionArgs[0])
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
    invariant(transaction.applicationTransaction, 'application-transaction is not set')
    invariant(transaction.applicationTransaction.applicationArgs, 'application-transaction application-args is not set')

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
        invariant(transaction.applicationTransaction?.foreignAssets, 'application-transaction foreign-assets is not set')
        const assetId = transaction.applicationTransaction.foreignAssets[Number(abiValue)]
        return {
          name: argName,
          type: DecodedAbiType.Asset,
          value: assetId,
          multiline: false,
          length: assetId.toString().length,
        }
      }
      if (argumentDefinition.type === ABIReferenceType.account) {
        invariant(transaction.applicationTransaction?.accounts, 'application-transaction accounts is not set')

        // Index 0 of application accounts is the sender
        const accountIndex = Number(abiValue)
        const accountAddress =
          accountIndex === 0 ? transaction.sender : transaction.applicationTransaction.accounts[accountIndex - 1].toString()
        return {
          name: argName,
          type: DecodedAbiType.Account,
          value: accountAddress,
          multiline: false,
          length: accountAddress.length,
        }
      }
      if (argumentDefinition.type === ABIReferenceType.application) {
        invariant(transaction.applicationTransaction?.foreignApps, 'application-transaction foreign-apps is not set')

        // Index 0 of foreign apps is the called app
        const applicationIndex = Number(abiValue)
        const applicationId =
          applicationIndex === 0
            ? transaction.createdApplicationIndex
              ? transaction.createdApplicationIndex
              : transaction.applicationTransaction.applicationId
            : transaction.applicationTransaction.foreignApps[applicationIndex - 1]
        return {
          name: argName,
          type: DecodedAbiType.Application,
          value: applicationId!,
          multiline: false,
          length: applicationId!.toString().length,
        }
      }

      if (argumentDefinition.struct) {
        return {
          name: argName,
          ...asDecodedAbiStruct(argumentDefinition.struct, abiValue),
        }
      }

      return {
        name: argName,
        ...asDecodedAbiValue(argumentDefinition.type, abiValue),
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
  const bytes = Uint8Array.from(transaction.logs.slice(-1)[0].subarray(4))
  const abiValue = abiType.decode(bytes)

  if (methodDefinition.returns.struct) {
    return asDecodedAbiStruct(methodDefinition.returns.struct, abiValue)
  } else {
    return asDecodedAbiValue(abiType, abiValue)
  }
}

const isPossibleAbiAppCallTransaction = (transaction: TransactionResult): boolean => {
  return (
    transaction.txType === TransactionType.appl &&
    transaction.applicationTransaction !== undefined &&
    transaction.confirmedRound !== undefined &&
    Boolean(transaction.applicationTransaction.applicationId) &&
    transaction.applicationTransaction.applicationArgs !== undefined &&
    transaction.applicationTransaction.applicationArgs.length > 0 &&
    transaction.applicationTransaction.applicationArgs[0].length === 4
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

    invariant(transaction.confirmedRound !== undefined && transaction.group, 'Cannot get referenced transactions without a group')
    const group = await get(groupResolver(uint8ArrayToBase64(transaction.group), transaction.confirmedRound))
    const transactionIndexInGroup = group.transactionIds.findIndex((id) => id === transaction.id)
    const transactionTypeArgsCount = abiMethod.args.filter((arg) => algosdk.abiTypeIsTransaction(arg.type)).length
    return group.transactionIds.slice(transactionIndexInGroup - transactionTypeArgsCount, transactionIndexInGroup)
  })
}

const getAbiValueArgs = (transaction: TransactionResult, abiMethod: algosdk.ABIMethod): algosdk.ABIValue[] => {
  invariant(transaction.applicationTransaction, 'application-transaction is not set')
  invariant(transaction.applicationTransaction.applicationArgs, 'application-transaction application-args is not set')

  // The first arg is the method selector
  const transactionArgs = transaction.applicationTransaction.applicationArgs.slice(1)
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

    const bytes = transactionArgs[14]
    results.push(...tupleType.decode(bytes))

    return results
  } else {
    return nonTransactionTypeArgs.map((argumentSpec, index) => mapAbiArgumentToAbiValue(argumentSpec.type, transactionArgs[index]))
  }
}

const mapAbiArgumentToAbiValue = (type: algosdk.ABIArgumentType, value: Uint8Array) => {
  if (type === ABIReferenceType.asset || type === ABIReferenceType.application || type === ABIReferenceType.account) {
    return new algosdk.ABIUintType(8).decode(value)
  }
  const abiType = algosdk.ABIType.from(type.toString())
  return abiType.decode(value)
}

const isValidAppSpecVersion = (appSpec: AppSpecVersion, round: Round) => {
  if (appSpec.roundFirstValid === undefined && appSpec.roundLastValid === undefined) {
    return true
  }
  if (appSpec.roundFirstValid === undefined) {
    return round <= appSpec.roundLastValid!
  }
  if (appSpec.roundLastValid === undefined) {
    return round >= appSpec.roundFirstValid!
  }
  return round >= appSpec.roundFirstValid! && round <= appSpec.roundLastValid!
}
