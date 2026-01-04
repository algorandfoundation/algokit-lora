import { encodeAddress } from '@algorandfoundation/algokit-utils'
import isUtf8 from 'isutf8'
import {
  DecodedGlobalStateDelta,
  DecodedLocalStateDelta,
  GlobalStateDelta,
  LocalStateDelta,
  RawGlobalStateDelta,
  RawLocalStateDelta,
} from '../models'
import { Buffer } from 'buffer'
import { ABIType, Arc56Contract } from '@algorandfoundation/algokit-utils/abi'
import { asDecodedAbiStorageValue } from '@/features/abi-methods/mappers'
import { base64ToBytes } from '@/utils/base64-to-bytes'
import { DecodedAbiType, DecodedAbiStorageValue, DecodedAbiStorageKeyType } from '@/features/abi-methods/models'
import { uint8ArrayStartsWith } from '@/utils/uint8-array-starts-with'
import { base64ToUtf8 } from '@/utils/base64-to-utf8'
import { Address } from '@/features/accounts/data/types'
import type { AccountStateDelta, EvalDelta, EvalDeltaKeyValue } from '@algorandfoundation/algokit-utils/indexer-client'
import { uint8ArrayToBase64 } from '@/utils/uint8-array-to-base64'

export const asGlobalStateDelta = (stateDelta: EvalDeltaKeyValue[] | undefined, appSpec?: Arc56Contract): GlobalStateDelta[] => {
  if (!stateDelta) {
    return []
  }

  return stateDelta.map((record) => asGlobalStateDeltaItem(record, appSpec))
}

const asGlobalStateDeltaItem = (record: EvalDeltaKeyValue, appSpec?: Arc56Contract): GlobalStateDelta => {
  if (!appSpec) {
    return asRawGlobalStateDelta(record)
  }

  const { key, value } = record
  const keyBase64 = uint8ArrayToBase64(key)
  // Check for global keys first
  for (const [keyName, storageKey] of Object.entries(appSpec.state.keys.global)) {
    if (storageKey.key === keyBase64) {
      return {
        key: {
          name: keyName,
          type: DecodedAbiStorageKeyType.Key,
          ...asDecodedAbiStorageValue(appSpec, storageKey.keyType, key),
        },
        value: mapEvalDeltaToDecodedArc56Value(appSpec, storageKey.valueType, value),
        action: getAction(value),
      } satisfies DecodedGlobalStateDelta
    }
  }

  // Check for global maps with prefix
  for (const [keyName, storageMap] of Object.entries(appSpec.state.maps.global)) {
    if (!storageMap.prefix) {
      continue
    }

    const prefixBytes = base64ToBytes(storageMap.prefix)
    if (uint8ArrayStartsWith(key, prefixBytes)) {
      const keyValueBytes = key.subarray(prefixBytes.length)

      return {
        key: {
          name: keyName,
          type: DecodedAbiStorageKeyType.MapKey,
          prefix: base64ToUtf8(storageMap.prefix),
          ...asDecodedAbiStorageValue(appSpec, storageMap.keyType, keyValueBytes),
        },
        action: getAction(value),
        value: mapEvalDeltaToDecodedArc56Value(appSpec, storageMap.valueType, value),
      } satisfies DecodedGlobalStateDelta
    }
  }

  // Check for global maps without prefix
  for (const [keyName, storageMap] of Object.entries(appSpec.state.maps.global)) {
    if (storageMap.prefix) {
      continue
    }

    try {
      return {
        key: {
          name: keyName,
          type: DecodedAbiStorageKeyType.MapKey,
          ...asDecodedAbiStorageValue(appSpec, storageMap.keyType, key),
        },
        action: getAction(value),
        value: mapEvalDeltaToDecodedArc56Value(appSpec, storageMap.valueType, value),
      } satisfies DecodedGlobalStateDelta
    } catch {
      // Do nothing
    }
  }

  // The default case
  return asRawGlobalStateDelta(record)
}

const asRawGlobalStateDelta = ({ key, value: state }: EvalDeltaKeyValue): RawGlobalStateDelta => {
  return {
    key: getKey(key),
    type: getType(state),
    action: getAction(state),
    value: getValue(state),
  }
}

const mapEvalDeltaToDecodedArc56Value = (appSpec: Arc56Contract, type: string, value: EvalDelta): DecodedAbiStorageValue => {
  if (value.uint !== undefined && value.bytes === undefined) {
    // When the value is uint, display it as uint64
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
  if (value.bytes) {
    return asDecodedAbiStorageValue(appSpec, type, value.bytes)
  }

  // default to empty string, this should never happen
  return {
    abiType: ABIType.from('string'),
    value: {
      type: DecodedAbiType.String,
      value: '',
      multiline: false,
      length: 0,
    },
  }
}

export const asLocalStateDelta = (stateDelta: AccountStateDelta[] | undefined, appSpec?: Arc56Contract): LocalStateDelta[] => {
  if (!stateDelta) {
    return []
  }

  return stateDelta.flatMap((record) => {
    const { address, delta } = record
    return delta.map((delta) => asLocalStateDeltaItem(address, delta, appSpec))
  })
}

const asLocalStateDeltaItem = (address: Address, delta: EvalDeltaKeyValue, appSpec?: Arc56Contract): LocalStateDelta => {
  if (!appSpec) {
    return asRawLocalStateDelta(address, delta)
  }

  const { key, value } = delta
  const keyBase64 = uint8ArrayToBase64(key)
  // Check for local keys first
  for (const [keyName, storageKey] of Object.entries(appSpec.state.keys.local)) {
    if (storageKey.key === keyBase64) {
      return {
        address,
        key: {
          name: keyName,
          type: DecodedAbiStorageKeyType.Key,
          ...asDecodedAbiStorageValue(appSpec, storageKey.keyType, key),
        },
        value: mapEvalDeltaToDecodedArc56Value(appSpec, storageKey.valueType, value),
        action: getAction(value),
      } satisfies DecodedLocalStateDelta
    }
  }

  // Check for local maps with prefix
  for (const [keyName, storageMap] of Object.entries(appSpec.state.maps.local)) {
    if (!storageMap.prefix) {
      continue
    }

    const prefixBytes = base64ToBytes(storageMap.prefix)
    if (uint8ArrayStartsWith(key, prefixBytes)) {
      const keyValueBytes = key.subarray(prefixBytes.length)

      return {
        address,
        key: {
          name: keyName,
          type: DecodedAbiStorageKeyType.MapKey,
          prefix: base64ToUtf8(storageMap.prefix),
          ...asDecodedAbiStorageValue(appSpec, storageMap.keyType, keyValueBytes),
        },
        action: getAction(value),
        value: mapEvalDeltaToDecodedArc56Value(appSpec, storageMap.valueType, value),
      } satisfies DecodedLocalStateDelta
    }
  }

  // Check for local maps without prefix
  for (const [keyName, storageMap] of Object.entries(appSpec.state.maps.local)) {
    if (storageMap.prefix) {
      continue
    }

    try {
      return {
        address,
        key: {
          name: keyName,
          type: DecodedAbiStorageKeyType.MapKey,
          ...asDecodedAbiStorageValue(appSpec, storageMap.keyType, key),
        },
        action: getAction(value),
        value: mapEvalDeltaToDecodedArc56Value(appSpec, storageMap.valueType, value),
      } satisfies DecodedLocalStateDelta
    } catch {
      // Do nothing
    }
  }

  // The default case
  return asRawLocalStateDelta(address, delta)
}

const asRawLocalStateDelta = (address: Address, { key, value }: EvalDeltaKeyValue): RawLocalStateDelta => {
  return {
    address,
    key: getKey(key),
    type: getType(value),
    action: getAction(value),
    value: getValue(value),
  }
}

const getKey = (key: Uint8Array): string => {
  const buffer = Buffer.from(key)

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
    const buf = Buffer.from(state.bytes)
    if (buf.length === 32) {
      return encodeAddress(state.bytes)
    } else {
      if (isUtf8(buf)) {
        return buf.toString('utf8')
      } else {
        return uint8ArrayToBase64(state.bytes)
      }
    }
  }
  return state.uint?.toString() ?? ''
}
