
export const isAVMType = (type: string | algosdk.ABIType): type is AVMType => {
  return typeof type === 'string' && ['AVMBytes', 'AVMString', 'AVMUint64'].includes(type)
}
