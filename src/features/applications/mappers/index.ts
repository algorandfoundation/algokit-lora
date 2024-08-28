import { Application, ApplicationGlobalStateType, ApplicationGlobalStateValue, ApplicationSummary } from '../models'
import algosdk, { encodeAddress, getApplicationAddress, modelsv2 } from 'algosdk'
import isUtf8 from 'isutf8'
import { Buffer } from 'buffer'
import { ApplicationMetadataResult, ApplicationResult } from '../data/types'
import { asJson } from '@/utils/as-json'

export const asApplicationSummary = (application: ApplicationResult): ApplicationSummary => {
  return {
    id: application.id,
  }
}

export const asApplication = (
  application: ApplicationResult,
  metadata: ApplicationMetadataResult,
  abiMethods: algosdk.ABIMethod[]
): Application => {
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
    abiMethods,
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
  } else {
    if (isUtf8(buf)) {
      return buf.toString('utf8')
    } else {
      return buf.toString('base64')
    }
  }
}
//
// export const asAbiMethodDefinition = (abiMethod: algosdk.ABIMethod): AbiMethodDefinition => {
//   const arguments = abiMethod.args.map((arg) => ({
//     name: arg.name,
//     type: arg.type,
//   }))
// }
//
// const asAbiMethodArgumentDefinition = (arg: algosdk.ABIMethod['args'][0]): AbiMethodArgumentDefinition => {
//   if (algosdk.abiTypeIsTransaction(arg.type)) {
//     return {
//       name: arg.name,
//       description: arg.description,
//       type: AbiType.Transaction,
//     }
//   }
//
//   if (algosdk.abiTypeIsReference(arg.type)) {
//     const map: Record<string, AbiType> = {
//       asset: AbiType.Asset,
//       account: AbiType.Account,
//       application: AbiType.Application,
//     }
//     return {
//       name: arg.name,
//       description: arg.description,
//       type: map[arg.type],
//     }
//   }
//
//
// }
//
//
// const foo = (arg: algosdk.ABIArgumentType): AbiMethodArgumentDefinition => {
