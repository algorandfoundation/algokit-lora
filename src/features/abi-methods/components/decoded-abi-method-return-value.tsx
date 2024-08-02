import algosdk from 'algosdk'
import { AppCallTransaction, InnerAppCallTransaction } from '@/features/transactions/models'
import { base64ToBytes } from '@/utils/base64-to-bytes'
import { RenderABIValue } from '@/features/abi-methods/components/render-abi-type-value'

export function DecodedAbiMethodReturnValue({
  method,
  transaction,
}: {
  method: algosdk.ABIMethod
  transaction: AppCallTransaction | InnerAppCallTransaction
}) {
  if (method.returns.type === 'void') return 'void'
  if (transaction.logs.length === 0) return 'void'

  const abiType = algosdk.ABIType.from(method.returns.type.toString())
  // The first 4 bytes are SHA512_256 hash of the string "return"
  const bytes = base64ToBytes(transaction.logs.slice(-1)[0]).subarray(4)
  const returnedValue = abiType.decode(bytes)

  return <RenderABIValue type={abiType} value={returnedValue} />
}
