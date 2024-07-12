import { encodeAddress } from 'algosdk'
import { AccountStateDelta, EvalDelta, StateDelta } from '@algorandfoundation/algokit-utils/types/indexer'
import isUtf8 from 'isutf8'
import { GlobalStateDelta, LocalStateDelta } from '../models'
import { Buffer } from 'buffer'

export const asGlobalStateDelta = (stateDelta: StateDelta | undefined): GlobalStateDelta[] => {
  if (!stateDelta) {
    return []
  }

  return stateDelta.map((record): GlobalStateDelta => {
    const key = record.key
    const state = record.value

    return {
      key: getKey(key),
      type: getType(state),
      action: getAction(state),
      value: getValue(state),
    }
  })
}

export const asLocalStateDelta = (stateDelta: AccountStateDelta[] | undefined): LocalStateDelta[] => {
  if (!stateDelta) {
    return []
  }

  return stateDelta.flatMap((record) => {
    const address = record.address
    return record.delta.map(({ key, value: state }) => ({
      address,
      key: getKey(key),
      type: getType(state),
      action: getAction(state),
      value: getValue(state),
    }))
  })
}

const getKey = (key: string): string => {
  const buffer = Buffer.from(key, 'base64')

  if (isUtf8(buffer)) {
    return buffer.toString()
  } else {
    return `0x${buffer.toString('hex')}`
  }
}
const getAction = (state: EvalDelta): 'Set' | 'Delete' => {
  if (state.action === 1 || state.action === 2) {
    return 'Set'
  }
  if (state.action === 3) {
    return 'Delete'
  }
  throw new Error(`Unsupported state action: ${state.action}`)
}
const getType = (state: EvalDelta): 'Bytes' | 'Uint' => {
  if (state.action === 1) return 'Bytes'
  if (state.action === 2) return 'Uint'
  if (state.action === 3) {
    if (state.bytes) return 'Bytes'
    return 'Uint'
  }
  throw new Error(`Unsupported state action: ${state.action}`)
}
const getValue = (state: EvalDelta) => {
  if (state.bytes) {
    const buf = Buffer.from(state.bytes, 'base64')
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
  return state.uint?.toString() ?? ''
}
