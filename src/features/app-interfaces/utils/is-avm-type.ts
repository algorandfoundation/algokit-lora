import { ABIType } from '@algorandfoundation/algokit-utils/algosdk_legacy'
import { AVMType } from '@algorandfoundation/algokit-utils/types/app-arc56'

export const isAVMType = (type: string | ABIType): type is AVMType => {
  return typeof type === 'string' && ['AVMBytes', 'AVMString', 'AVMUint64'].includes(type)
}
