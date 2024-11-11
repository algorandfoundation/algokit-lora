import { AVMType } from '@algorandfoundation/algokit-utils/types/app-arc56'
import algosdk from 'algosdk'

export const isAVMType = (type: string | algosdk.ABIType): type is AVMType => {
  return typeof type === 'string' && ['AVMBytes', 'AVMString', 'AVMUint64'].includes(type)
}
