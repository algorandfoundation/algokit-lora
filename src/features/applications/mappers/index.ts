import {
  Application,
  RawApplicationStateType,
  ApplicationSummary,
  ArgumentDefinition,
  ApplicationState,
  DecodedApplicationState,
  RawApplicationState,
  MethodDefinition,
  StructDefinition,
  StructFieldType,
  BoxDescriptor,
  DecodedBoxDescriptor,
  RawBoxDescriptor,
} from '../models'
import { encodeAddress, getApplicationAddress } from '@algorandfoundation/algokit-utils/common'
import { OnApplicationComplete } from '@algorandfoundation/algokit-utils/transact'
import { TealKeyValue, TealKeyValueStore, TealValue } from '@algorandfoundation/algokit-utils/algod-client'
import isUtf8 from 'isutf8'
import { ApplicationMetadataResult, ApplicationResult } from '../data/types'
import { asJson, normaliseAlgoSdkData } from '@/utils/as-json'
import { AppSpec, Arc32AppSpec } from '@/features/app-interfaces/data/types'
import { isArc32AppSpec, isArc4AppSpec, isArc56AppSpec } from '@/features/common/utils'
import { AppSpec as UtiltsAppSpec, arc32ToArc56 } from '@algorandfoundation/algokit-utils/types/app-spec'
import { Hint } from '@/features/app-interfaces/data/types/arc-32/application'
import { base64ToUtf8, base64ToUtf8IfValid } from '@/utils/base64-to-utf8'
import { ABIMethod, ABIStructType, ABIType, Arc56Contract, StructField } from '@algorandfoundation/algokit-utils/abi'
import { invariant } from '@/utils/invariant'
import { base64ToBytes } from '@/utils/base64-to-bytes'
import { DecodedAbiStorageKeyType, DecodedAbiStorageValue, DecodedAbiType } from '@/features/abi-methods/models'
import { asDecodedAbiStorageValue } from '@/features/abi-methods/mappers'
import { uint8ArrayStartsWith } from '@/utils/uint8-array-starts-with'
import { ZERO_ADDRESS } from '@/features/common/constants'
import { uint8ArrayToBase64 } from '@/utils/uint8-array-to-base64'

export const asApplicationSummary = (application: ApplicationResult): ApplicationSummary => {
  return {
    id: application.id,
  }
}

export const asApplication = (
  application: ApplicationResult,
  metadata: ApplicationMetadataResult,
  appSpec?: Arc56Contract
): Application => {
  return {
    id: application.id,
    name: metadata?.name,
    creator: application.params.creator?.toString() ?? ZERO_ADDRESS,
    account: getApplicationAddress(application.id).toString(),
    globalStateSchema: application.params.globalStateSchema
      ? {
          numByteSlice: application.params.globalStateSchema.numByteSlice,
          numUint: application.params.globalStateSchema.numUint,
        }
      : undefined,
    localStateSchema: application.params.localStateSchema
      ? {
          numByteSlice: application.params.localStateSchema.numByteSlice,
          numUint: application.params.localStateSchema.numUint,
        }
      : undefined,
    approvalProgram: uint8ArrayToBase64(application.params.approvalProgram),
    clearStateProgram: uint8ArrayToBase64(application.params.clearStateProgram),
    globalState: asGlobalStateValues(application.params.globalState, appSpec),
    isDeleted: application.deleted ?? false,
    json: asJson(normaliseAlgoSdkData(application)),
    appSpec,
  }
}

export const asGlobalStateValues = (
  globalState: ApplicationResult['params']['globalState'],
  appSpec?: Arc56Contract
): ApplicationState[] => {
  if (!globalState) {
    return []
  }

  return globalState
    .map((state) => asApplicationState(state, 'global', appSpec))
    .sort((a, b) => {
      const aKey = typeof a.key === 'string' ? a.key : a.key.name
      const bKey = typeof b.key === 'string' ? b.key : b.key.name
      return aKey.localeCompare(bKey)
    })
}

const asRawApplicationStateKey = (key: Uint8Array): string => {
  const buffer = Buffer.from(key)

  if (isUtf8(buffer)) {
    return buffer.toString()
  } else {
    return uint8ArrayToBase64(key)
  }
}

const asRawApplicationStateValue = (bytes: Uint8Array) => {
  if (bytes.length === 32) {
    return encodeAddress(bytes)
  }
  return base64ToUtf8IfValid(uint8ArrayToBase64(bytes))
}

const getRawApplicationState = (state: TealKeyValue): RawApplicationState => {
  if (state.value.type === 1) {
    return {
      key: asRawApplicationStateKey(state.key),
      type: RawApplicationStateType.Bytes,
      value: asRawApplicationStateValue(state.value.bytes),
    }
  }
  if (state.value.type === 2) {
    return {
      key: asRawApplicationStateKey(state.key),
      type: RawApplicationStateType.Uint,
      value: state.value.uint,
    }
  }
  throw new Error(`Unknown type ${state.value.type}`)
}

const asApplicationState = (state: TealKeyValue, type: 'local' | 'global', appSpec?: Arc56Contract): ApplicationState => {
  const { key: keyBytes, value } = state
  const key = uint8ArrayToBase64(keyBytes)

  if (!appSpec) {
    return getRawApplicationState(state)
  }

  try {
    // Check for local/global keys first
    for (const [keyName, storageKey] of Object.entries(appSpec.state.keys[type])) {
      if (storageKey.key === key) {
        return {
          key: {
            name: keyName,
            type: DecodedAbiStorageKeyType.Key,
            ...asDecodedAbiStorageValue(appSpec, storageKey.keyType, base64ToBytes(key)),
          },
          value: tealValueToAbiStorageValue(appSpec, storageKey.valueType, value),
        } satisfies DecodedApplicationState
      }
    }

    // Check for local/global maps with prefix
    for (const [keyName, storageMap] of Object.entries(appSpec.state.maps[type])) {
      if (!storageMap.prefix) {
        continue
      }
      const keyBytes = base64ToBytes(key)

      const prefixBytes = base64ToBytes(storageMap.prefix)
      if (uint8ArrayStartsWith(keyBytes, prefixBytes)) {
        const keyValueBytes = keyBytes.subarray(prefixBytes.length)

        return {
          key: {
            name: keyName,
            type: DecodedAbiStorageKeyType.MapKey,
            prefix: base64ToUtf8(storageMap.prefix),
            ...asDecodedAbiStorageValue(appSpec, storageMap.keyType, keyValueBytes),
          },
          value: tealValueToAbiStorageValue(appSpec, storageMap.valueType, value),
        } satisfies DecodedApplicationState
      }
    }

    // Check for local/global maps without prefix
    for (const [keyName, storageMap] of Object.entries(appSpec.state.maps[type])) {
      if (storageMap.prefix) {
        continue
      }

      try {
        const keyValueBytes = base64ToBytes(key)

        return {
          key: {
            name: keyName,
            type: DecodedAbiStorageKeyType.MapKey,
            ...asDecodedAbiStorageValue(appSpec, storageMap.keyType, keyValueBytes),
          },
          value: tealValueToAbiStorageValue(appSpec, storageMap.valueType, value),
        } satisfies DecodedApplicationState
      } catch {
        // Do nothing
      }
    }
  } catch (e: unknown) {
    // eslint-disable-next-line no-console
    console.warn('Failed to decode application state', e)
  }

  // The default case
  return getRawApplicationState(state)
}

export const asLocalStateValues = (localState: TealKeyValueStore, appSpec?: Arc56Contract): ApplicationState[] => {
  if (!localState) {
    return []
  }

  return localState
    .map((state) => asApplicationState(state, 'local', appSpec))
    .sort((a, b) => {
      const aKey = typeof a.key === 'string' ? a.key : a.key.name
      const bKey = typeof b.key === 'string' ? b.key : b.key.name
      return aKey.localeCompare(bKey)
    })
}

const tealValueToAbiStorageValue = (appSpec: Arc56Contract, type: string, value: TealValue): DecodedAbiStorageValue => {
  if (value.type === 2) {
    // When the teal value is uint, display it as uint64
    const b = BigInt(value.uint)
    return {
      abiType: ABIType.from('uint64'),
      value: {
        type: DecodedAbiType.Uint,
        value: b,
        multiline: false,
        length: `${b}`.length,
      },
    } satisfies DecodedAbiStorageValue
  }

  return asDecodedAbiStorageValue(appSpec, type, value.bytes)
}

export const asArc56AppSpec = (appSpec: AppSpec): Arc56Contract => {
  if (isArc56AppSpec(appSpec)) {
    return appSpec
  }
  if (isArc32AppSpec(appSpec)) {
    return arc32ToArc56(appSpec as UtiltsAppSpec)
  }
  if (isArc4AppSpec(appSpec)) {
    const abiMethods = appSpec.methods.map((method) => {
      return new ABIMethod({
        name: method.name,
        desc: method.desc,
        args: method.args,
        returns: method.returns,
      })
    })

    const arc32AppSpec = {
      // Build a basic ARC-32 app spec from the ARC-4 one
      contract: appSpec,
      hints: abiMethods.reduce(
        (acc, method) => {
          return {
            ...acc,
            [method.getSignature()]: {
              call_config: {
                no_op: 'CALL',
                opt_in: 'CALL',
                close_out: 'CALL',
                update_application: 'CALL',
                delete_application: 'CALL',
              },
            },
          }
        },
        {} as {
          [k: string]: Hint
        }
      ),
      state: {
        global: {
          num_byte_slices: 0,
          num_uints: 0,
        },
        local: {
          num_byte_slices: 0,
          num_uints: 0,
        },
      },
      schema: {
        global: {
          declared: {},
          reserved: {},
        },
        local: {
          declared: {},
          reserved: {},
        },
      },
      bare_call_config: {},
      source: {
        approval: '',
        clear: '',
      },
    } satisfies Arc32AppSpec

    return arc32ToArc56(arc32AppSpec as UtiltsAppSpec)
  }

  throw new Error('Invalid app spec')
}

export const asStructDefinition = (structName: string, structs: Record<string, StructField[]>): StructDefinition => {
  const getStructFieldType = (structFieldType: StructField['type']): StructFieldType => {
    if (Array.isArray(structFieldType)) {
      return structFieldType.map((structField) => ({
        name: structField.name,
        type: getStructFieldType(structField.type),
      }))
    }
    if (structs[structFieldType]) {
      return structs[structFieldType].map((structField) => ({
        name: structField.name,
        type: getStructFieldType(structField.type),
      }))
    }
    return ABIType.from(structFieldType)
  }

  invariant(structs[structName], 'Struct not found')

  const fields = structs[structName]
  return {
    name: structName,
    fields: fields.map((f) => ({
      name: f.name,
      type: getStructFieldType(f.type),
    })),
  }
}

const asOnApplicationComplete = (
  action: 'NoOp' | 'OptIn' | 'CloseOut' | 'ClearState' | 'UpdateApplication' | 'DeleteApplication'
): OnApplicationComplete => {
  switch (action) {
    case 'NoOp':
      return OnApplicationComplete.NoOp
    case 'OptIn':
      return OnApplicationComplete.OptIn
    case 'CloseOut':
      return OnApplicationComplete.CloseOut
    case 'ClearState':
      return OnApplicationComplete.ClearState
    case 'UpdateApplication':
      return OnApplicationComplete.UpdateApplication
    case 'DeleteApplication':
      return OnApplicationComplete.DeleteApplication
  }
}

export const asMethodDefinitions = (appSpec: AppSpec): MethodDefinition[] => {
  const arc56AppSpec = asArc56AppSpec(appSpec)
  return arc56AppSpec.methods.map((method) => {
    const abiMethod = new ABIMethod({
      name: method.name,
      desc: method.desc,
      args: method.args,
      returns: method.returns,
    })

    const methodArgs = method.args.map((arg, i) => {
      const getStructDefinition = () => {
        if (!arg.struct) return undefined
        const structTupleType = ABIStructType.fromStruct(arg.struct, arc56AppSpec.structs).toABITupleType()
        if (structTupleType.toString() === abiMethod.args[i].type.toString()) {
          return asStructDefinition(arg.struct, arc56AppSpec.structs)
        }
        return undefined
      }

      return {
        name: arg.name,
        description: arg.desc,
        type: abiMethod.args[i].type,
        struct: getStructDefinition(),
        defaultArgument: arg.defaultValue,
      } satisfies ArgumentDefinition
    })

    return {
      name: abiMethod.name,
      signature: abiMethod.getSignature(),
      description: abiMethod.description,
      arguments: methodArgs,
      abiMethod: abiMethod,
      callConfig: {
        call: method.actions.call.map((a) => asOnApplicationComplete(a)),
        create: method.actions.create.map((a) => asOnApplicationComplete(a)),
      },
      returns: {
        description: method.returns.desc,
        struct:
          method.returns.struct && arc56AppSpec.structs[method.returns.struct]
            ? asStructDefinition(method.returns.struct, arc56AppSpec.structs)
            : undefined,
        type: abiMethod.returns.type,
      },
    } satisfies MethodDefinition
  })
}

export const asBoxDescriptor = (base64Name: string, appSpec?: Arc56Contract): BoxDescriptor => {
  if (!appSpec) {
    return {
      base64Name: base64Name,
      name: base64ToUtf8IfValid(base64Name),
    } satisfies RawBoxDescriptor
  }

  // Check for box keys first
  for (const [keyName, storageKey] of Object.entries(appSpec.state.keys.box)) {
    if (storageKey.key === base64Name) {
      return {
        base64Name: base64Name,
        name: keyName,
        valueType: storageKey.valueType,
        type: DecodedAbiStorageKeyType.Key,
        ...asDecodedAbiStorageValue(appSpec, storageKey.keyType, base64ToBytes(base64Name)),
      } satisfies DecodedBoxDescriptor
    }
  }

  // Check for box maps with prefix
  for (const [keyName, storageMap] of Object.entries(appSpec.state.maps.box)) {
    if (!storageMap.prefix) {
      continue
    }
    const keyBytes = base64ToBytes(base64Name)
    const prefixBytes = base64ToBytes(storageMap.prefix)

    if (uint8ArrayStartsWith(keyBytes, prefixBytes)) {
      const keyValueBytes = keyBytes.subarray(prefixBytes.length)

      return {
        base64Name: base64Name,
        name: keyName,
        prefix: base64ToUtf8(storageMap.prefix),
        valueType: storageMap.valueType,
        type: DecodedAbiStorageKeyType.MapKey,
        ...asDecodedAbiStorageValue(appSpec, storageMap.keyType, keyValueBytes),
      } satisfies DecodedBoxDescriptor
    }
  }

  // Check for box maps without prefix
  for (const [keyName, storageMap] of Object.entries(appSpec.state.maps.box)) {
    if (storageMap.prefix) {
      continue
    }
    try {
      const keyValueBytes = base64ToBytes(base64Name)
      // try to convert to ARC56Value, if it fails, this is not the right map
      asDecodedAbiStorageValue(appSpec, storageMap.keyType, keyValueBytes)

      return {
        base64Name: base64Name,
        name: keyName,
        valueType: storageMap.valueType,
        type: DecodedAbiStorageKeyType.MapKey,
        ...asDecodedAbiStorageValue(appSpec, storageMap.keyType, keyValueBytes),
      } satisfies DecodedBoxDescriptor
    } catch {
      // Do nothing
    }
  }

  return {
    base64Name: base64Name,
    name: base64ToUtf8IfValid(base64Name),
  } satisfies RawBoxDescriptor
}
