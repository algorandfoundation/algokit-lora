import {
  Application,
  ApplicationAbiMethods,
  ApplicationGlobalStateType,
  ApplicationGlobalStateValue,
  ApplicationSummary,
  ArgumentDefinition,
  ArgumentHint,
  MethodDefinition,
} from '../models'
import algosdk, { encodeAddress, getApplicationAddress, modelsv2 } from 'algosdk'
import isUtf8 from 'isutf8'
import { Buffer } from 'buffer'
import { ApplicationMetadataResult, ApplicationResult } from '../data/types'
import { asJson } from '@/utils/as-json'
import { Arc32AppSpec, Arc4AppSpec } from '@/features/app-interfaces/data/types'
import { isArc32AppSpec } from '@/features/common/utils'
import { CallConfigValue } from '@algorandfoundation/algokit-utils/types/app-spec'
import { Hint } from '@/features/app-interfaces/data/types/arc-32/application'
import { base64ToUtf8IfValid } from '@/utils/base64-to-utf8'

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

const callValues: CallConfigValue[] = ['ALL', 'CALL']
const createValue: CallConfigValue[] = ['ALL', 'CREATE']

export const asApplicationAbiMethods = (appSpec: Arc32AppSpec | Arc4AppSpec): ApplicationAbiMethods => {
  const isArc32 = isArc32AppSpec(appSpec)
  const contract = isArc32 ? appSpec.contract : appSpec
  const abiMethods = contract.methods.map((method) => {
    return new algosdk.ABIMethod({
      name: method.name,
      desc: method.desc,
      args: method.args,
      returns: method.returns,
    })
  })
  const unifiedAppSpec = isArc32
    ? appSpec
    : ({
        // Build a basic ARC-32 app spec from the ARC-4 one
        contract: contract,
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
      } satisfies Arc32AppSpec)

  const methods = abiMethods.map((abiMethod) => {
    const signature = abiMethod.getSignature()
    const hint = unifiedAppSpec.hints ? unifiedAppSpec.hints[signature] : undefined

    const methodArgs = abiMethod.args.map((arg) => {
      const argHint =
        hint &&
        arg.name &&
        (('structs' in hint && hint.structs?.[arg.name]) || ('default_arguments' in hint && hint.default_arguments?.[arg.name]))
          ? ({
              struct: hint.structs?.[arg.name],
              defaultArgument: hint.default_arguments?.[arg.name],
            } satisfies ArgumentHint)
          : undefined

      const argument = {
        name: arg.name,
        description: arg.description,
        type: arg.type,
        hint: argHint,
      } satisfies ArgumentDefinition

      return argument
    })

    return {
      name: abiMethod.name,
      signature: signature,
      description: abiMethod.description,
      arguments: methodArgs,
      abiMethod: abiMethod,
      callConfig: hint?.call_config
        ? {
            call: [
              ...(callValues.includes(hint.call_config.no_op ?? 'NEVER') ? [algosdk.OnApplicationComplete.NoOpOC] : []),
              ...(callValues.includes(hint.call_config.opt_in ?? 'NEVER') ? [algosdk.OnApplicationComplete.OptInOC] : []),
              ...(callValues.includes(hint.call_config.close_out ?? 'NEVER') ? [algosdk.OnApplicationComplete.CloseOutOC] : []),
              ...(callValues.includes(hint.call_config.update_application ?? 'NEVER')
                ? [algosdk.OnApplicationComplete.UpdateApplicationOC]
                : []),
              ...(callValues.includes(hint.call_config.delete_application ?? 'NEVER')
                ? [algosdk.OnApplicationComplete.DeleteApplicationOC]
                : []),
            ],
            create: [
              ...(createValue.includes(hint.call_config.no_op ?? 'NEVER') ? [algosdk.OnApplicationComplete.NoOpOC] : []),
              ...(createValue.includes(hint.call_config.opt_in ?? 'NEVER') ? [algosdk.OnApplicationComplete.OptInOC] : []),
              ...(createValue.includes(hint.call_config.close_out ?? 'NEVER') ? [algosdk.OnApplicationComplete.CloseOutOC] : []),
              ...(createValue.includes(hint.call_config.update_application ?? 'NEVER')
                ? [algosdk.OnApplicationComplete.UpdateApplicationOC]
                : []),
              ...(createValue.includes(hint.call_config.delete_application ?? 'NEVER')
                ? [algosdk.OnApplicationComplete.DeleteApplicationOC]
                : []),
            ],
          }
        : undefined,
      returns: {
        ...abiMethod.returns,
        hint:
          hint && 'structs' in hint && hint.structs?.['output']
            ? {
                struct: hint.structs?.['output'],
              }
            : undefined,
      },
    } satisfies MethodDefinition
  })

  return {
    appSpec: unifiedAppSpec,
    methods,
  }
}
