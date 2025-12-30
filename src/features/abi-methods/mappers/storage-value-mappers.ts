import { isAVMType } from '@/features/app-interfaces/utils/is-avm-type'
import { asStructDefinition } from '@/features/applications/mappers'
import { uint8ArrayToBase64 } from '@/utils/uint8-array-to-base64'
import { Arc56Contract } from '@algorandfoundation/algokit-utils/abi'
import { asAbiOrAvmType } from '.'
import { DecodedAbiStorageValue } from '../models'
import { asDecodedAvmValue } from './avm-value'
import { asDecodedAbiStruct, asDecodedAbiValue } from './decoder'

export const asDecodedAbiStorageValue = (appSpec: Arc56Contract, type: string, bytes: Uint8Array): DecodedAbiStorageValue => {
  const struct = appSpec.structs[type]
  const structDefinition = struct ? asStructDefinition(type, appSpec.structs) : undefined

  const valueType = asAbiOrAvmType(appSpec, type)

  if (isAVMType(valueType)) {
    return {
      avmType: valueType,
      value: asDecodedAvmValue(valueType, uint8ArrayToBase64(bytes)),
    } satisfies DecodedAbiStorageValue
  }

  if (structDefinition) {
    return {
      abiType: valueType,
      struct: structDefinition,
      value: asDecodedAbiStruct(structDefinition, valueType.decode(bytes)),
    } satisfies DecodedAbiStorageValue
  }

  return {
    abiType: valueType,
    value: asDecodedAbiValue(valueType, valueType.decode(bytes)),
  } satisfies DecodedAbiStorageValue
}
