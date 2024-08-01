import { atom } from 'jotai'
import { applicationsAppSpecsAtom } from '@/features/abi-methods/data'
import algosdk, { TransactionType } from 'algosdk'
import { uint8ArrayToBase64 } from '@/utils/uint8-array-to-base64'
import { AsyncMaybeAtom } from '@/features/common/data/types'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'

export const abiMethodResolver = (transaction: TransactionResult): AsyncMaybeAtom<algosdk.ABIMethod | undefined> => {
  return atom(async (get) => {
    if (transaction['tx-type'] !== TransactionType.appl || !transaction['application-transaction']) return undefined

    const applicationAppSpecs = await get(applicationsAppSpecsAtom(transaction['application-transaction']['application-id']))
    // TODO: handle multiple app specs
    const appSpec = applicationAppSpecs?.appSpecs[0]?.spec
    const transactionArgs = transaction['application-transaction']['application-args'] ?? []
    if (transactionArgs.length && appSpec) {
      const methodContract = appSpec.contract.methods.find((m) => {
        const abiMethod = new algosdk.ABIMethod(m)
        return uint8ArrayToBase64(abiMethod.getSelector()) === transactionArgs[0]
      })
      if (methodContract) return new algosdk.ABIMethod(methodContract)
    }

    return undefined
  })
}
