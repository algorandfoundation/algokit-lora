import { ABIType, AVMType } from '@algorandfoundation/algokit-utils/abi'

export const isAVMType = (type: string | ABIType | AVMType): type is AVMType => {
  return typeof type === 'string' && ['AVMBytes', 'AVMString', 'AVMUint64'].includes(type)
}
