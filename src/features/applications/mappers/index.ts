import {
  Application,
  ApplicationGlobalStateType,
  ApplicationGlobalStateValue,
  ApplicationSummary,
  ArgumentDefinition,
  MethodDefinition,
  StructDefinition,
  StructFieldType,
} from '../models'
import algosdk, { encodeAddress, getApplicationAddress, modelsv2 } from 'algosdk'
import isUtf8 from 'isutf8'
import { Buffer } from 'buffer'
import { ApplicationMetadataResult, ApplicationResult } from '../data/types'
import { asJson } from '@/utils/as-json'
import { AppSpec, Arc32AppSpec } from '@/features/app-interfaces/data/types'
import { isArc32AppSpec, isArc4AppSpec, isArc56AppSpec } from '@/features/common/utils'
import { AppSpec as UtiltsAppSpec, arc32ToArc56 } from '@algorandfoundation/algokit-utils/types/app-spec'
import { Hint } from '@/features/app-interfaces/data/types/arc-32/application'
import { base64ToUtf8IfValid } from '@/utils/base64-to-utf8'
import { Arc56Contract, StructField } from '@algorandfoundation/algokit-utils/types/app-arc56'
import { invariant } from '@/utils/invariant'

export const asApplicationSummary = (application: ApplicationResult): ApplicationSummary => {
  return {
    id: application.id,
  }
}

export const asApplication = (application: ApplicationResult, metadata: ApplicationMetadataResult): Application => {
  return {
    id: application.id,
    name: metadata?.name,
    creator: application.params.creator,
    account: getApplicationAddress(application.id),
    globalStateSchema: application.params['global-state-schema']
      ? {
          numByteSlice: application.params['global-state-schema']['num-byte-slice'],
          numUint: application.params['global-state-schema']['num-uint'],
        }
      : undefined,
    localStateSchema: application.params['local-state-schema']
      ? {
          numByteSlice: application.params['local-state-schema']['num-byte-slice'],
          numUint: application.params['local-state-schema']['num-uint'],
        }
      : undefined,
    approvalProgram: application.params['approval-program'],
    clearStateProgram: application.params['clear-state-program'],
    globalState: asGlobalStateValue(application.params['global-state']),
    isDeleted: application.deleted ?? false,
    json: asJson(application),
  }
}

export const asGlobalStateValue = (globalState: ApplicationResult['params']['global-state']): Application['globalState'] => {
  if (!globalState) {
    return
  }

  return new Map(
    globalState
      .map(({ key, value }) => {
        return [getKey(key), getGlobalStateValue(value)] as const
      })
      .sort((a, b) => a[0].localeCompare(b[0]))
  )
}

const getKey = (key: string): string => {
  const buffer = Buffer.from(key, 'base64')

  if (isUtf8(buffer)) {
    return buffer.toString()
  } else {
    return `0x${buffer.toString('hex')}`
  }
}

const getGlobalStateValue = (tealValue: modelsv2.TealValue): ApplicationGlobalStateValue => {
  if (tealValue.type === 1) {
    return {
      type: ApplicationGlobalStateType.Bytes,
      value: getValue(tealValue.bytes),
    }
  }
  if (tealValue.type === 2) {
    return {
      type: ApplicationGlobalStateType.Uint,
      value: tealValue.uint,
    }
  }
  throw new Error(`Unknown type ${tealValue.type}`)
}

const getValue = (bytes: string) => {
  const buf = Buffer.from(bytes, 'base64')
  if (buf.length === 32) {
    return encodeAddress(new Uint8Array(buf))
  }
  return base64ToUtf8IfValid(bytes)
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
      return new algosdk.ABIMethod({
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

const getStructDefinition = (structName: string, structs: Record<string, StructField[]>): StructDefinition => {
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
    return algosdk.ABIType.from(structFieldType)
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
): algosdk.OnApplicationComplete => {
  switch (action) {
    case 'NoOp':
      return algosdk.OnApplicationComplete.NoOpOC
    case 'OptIn':
      return algosdk.OnApplicationComplete.OptInOC
    case 'CloseOut':
      return algosdk.OnApplicationComplete.CloseOutOC
    case 'ClearState':
      return algosdk.OnApplicationComplete.ClearStateOC
    case 'UpdateApplication':
      return algosdk.OnApplicationComplete.UpdateApplicationOC
    case 'DeleteApplication':
      return algosdk.OnApplicationComplete.DeleteApplicationOC
  }
}

export const asMethodDefinitions = (appSpec: AppSpec): MethodDefinition[] => {
  const arc56AppSpec = asArc56AppSpec(appSpec)
  return arc56AppSpec.methods.map((method) => {
    const abiMethod = new algosdk.ABIMethod({
      name: method.name,
      desc: method.desc,
      args: method.args,
      returns: method.returns,
    })

    const methodArgs = method.args.map((arg, i) => {
      return {
        name: arg.name,
        description: arg.desc,
        type: abiMethod.args[i].type,
        struct: arg.struct && arc56AppSpec.structs[arg.struct] ? getStructDefinition(arg.struct, arc56AppSpec.structs) : undefined,
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
            ? getStructDefinition(method.returns.struct, arc56AppSpec.structs)
            : undefined,
        type: abiMethod.returns.type,
      },
    } satisfies MethodDefinition
  })
}
