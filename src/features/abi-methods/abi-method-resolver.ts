import { Atom, atom } from 'jotai'
import { applicationsAppSpecsAtom } from '@/features/abi-methods/data'
import algosdk, { TransactionType } from 'algosdk'
import { uint8ArrayToBase64 } from '@/utils/uint8-array-to-base64'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { Round } from '@/features/blocks/data/types'
import { AppSpecVersion } from '@/features/abi-methods/data/types'

export const abiMethodResolver = (transaction: TransactionResult): Atom<Promise<algosdk.ABIMethod | undefined>> => {
  return atom(async (get) => {
    if (transaction['tx-type'] !== TransactionType.appl || !transaction['application-transaction'] || !transaction['confirmed-round']) {
      return undefined
    }

    const applicationAppSpecs = await get(applicationsAppSpecsAtom(transaction['application-transaction']['application-id']))
    const appSpecVersion = applicationAppSpecs?.appSpecVersions.find((appSpecVersion) =>
      isValidAppSpecVersion(appSpecVersion, transaction['confirmed-round']!)
    )
    const transactionArgs = transaction['application-transaction']['application-args'] ?? []
    if (transactionArgs.length && appSpecVersion) {
      const methodContract = appSpecVersion.appSpec.contract.methods.find((m) => {
        const abiMethod = new algosdk.ABIMethod(m)
        return uint8ArrayToBase64(abiMethod.getSelector()) === transactionArgs[0]
      })
      if (methodContract) return new algosdk.ABIMethod(methodContract)
    }

    return undefined
  })
}

const isValidAppSpecVersion = (appSpec: AppSpecVersion, round: Round) => {
  const validFromRound = appSpec.validUntilRound ?? -1
  const validToRound = appSpec.validUntilRound ?? Number.MAX_SAFE_INTEGER
  return validFromRound <= round && round <= validToRound
}
