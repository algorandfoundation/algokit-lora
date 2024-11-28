import { DecodedAvmType, DecodedAvmValue as DecodedAvmValueModel } from '../models'

export function DecodedAvmValue({ avmValue }: { avmValue: DecodedAvmValueModel }) {
  if (avmValue.type === DecodedAvmType.String) {
    return <span className="text-abi-string">{`"${avmValue.value}"`}</span>
  }
  if (avmValue.type === DecodedAvmType.Uint) {
    return <span className="text-abi-number">{avmValue.value.toString()}</span>
  }
  if (avmValue.type === DecodedAvmType.Bytes) {
    return <span>{avmValue.value}</span>
  }
}
