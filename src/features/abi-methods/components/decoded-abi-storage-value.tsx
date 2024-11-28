import { DecodedAbiStorageValue as DecodedAbiStorageValueModel } from '../models'
import { DecodedAbiStruct } from './decoded-abi-struct'
import { DecodedAbiValue } from './decoded-abi-value'
import { DecodedAvmValue } from './decoded-avm-value'

export function DecodedAbiStorageValue({ value }: { value: DecodedAbiStorageValueModel }) {
  if ('avmType' in value) {
    return <DecodedAvmValue avmValue={value.value} />
  }
  if ('struct' in value) {
    return <DecodedAbiStruct struct={value.value} />
  }
  return <DecodedAbiValue abiValue={value.value} />
}
