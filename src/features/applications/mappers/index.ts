import { Application, ApplicationGlobalStateType, ApplicationGlobalStateValue } from '../models'
import { ApplicationResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { getApplicationAddress, modelsv2, encodeAddress } from 'algosdk'
import isUtf8 from 'isutf8'
import { Buffer } from 'buffer'

export const asApplication = (application: ApplicationResult): Application => {
  return {
    id: application.id,
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
    globalState: asGlobalStateValue(application),
  }
}

export const asGlobalStateValue = (application: ApplicationResult): Map<string, ApplicationGlobalStateValue> => {
  const arr = application.params['global-state']
    .map(({ key, value }) => {
      return [getKey(key), getGlobalStateValue(value)] as const
    })
    .sort((a, b) => a[0].localeCompare(b[0]))
  return new Map(arr)
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
