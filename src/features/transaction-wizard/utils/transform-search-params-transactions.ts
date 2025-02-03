import {
  BaseSearchParamTransaction,
  BuildableTransactionType,
  BuildKeyRegistrationTransactionResult,
  BuildTransactionResult,
} from '../models'
import { keyRegistrationFormSchema } from '../components/key-registration-transaction-builder'
import { z } from 'zod'
import { randomGuid } from '@/utils/random-guid'
import algosdk from 'algosdk'
import { microAlgo } from '@algorandfoundation/algokit-utils'

// This is a workaround to make the online field a boolean instead of a string.
// A string type is used in the form schema because of the value of radio buttons cant be boolean
const keyRegFormSchema = keyRegistrationFormSchema.innerType().extend({
  online: z.boolean(),
})

const transformKeyRegistrationTransaction = (params: BaseSearchParamTransaction): BuildKeyRegistrationTransactionResult => ({
  id: randomGuid(),
  type: BuildableTransactionType.KeyRegistration,
  sender: {
    value: params.sender,
    resolvedAddress: params.sender,
  },
  online: Boolean(params.votekey),
  fee: params.fee ? { setAutomatically: false, value: microAlgo(Number(params.fee)).algo } : { setAutomatically: true },
  voteKey: params.votekey,
  selectionKey: params.selkey,
  voteFirstValid: params.votefst ? BigInt(params.votefst) : undefined,
  voteLastValid: params.votelst ? BigInt(params.votelst) : undefined,
  voteKeyDilution: params.votekd ? BigInt(params.votekd) : undefined,
  stateProofKey: params.sprfkey,
  validRounds: {
    setAutomatically: true,
    firstValid: undefined,
    lastValid: undefined,
  },
})

export function transformSearchParamsTransactions(searchParamTransactions: BaseSearchParamTransaction[]) {
  const transactionsFromSearchParams: BuildTransactionResult[] = []
  const errors: string[] = []
  for (const [index, searchParamTransaction] of searchParamTransactions.entries()) {
    try {
      if (searchParamTransaction.type === algosdk.TransactionType.keyreg) {
        const keyRegTransaction = transformKeyRegistrationTransaction(searchParamTransaction)
        keyRegFormSchema.parse(keyRegTransaction)
        transactionsFromSearchParams.push(keyRegTransaction)
      }
      // TODO: Add other transaction types
    } catch (error) {
      if (error instanceof z.ZodError) {
        const badPaths = error.errors.map((e) => e.path.join('-'))
        errors.push(`Error in transaction at index ${index} in the following fields: ${badPaths.join(', ')}`)
        continue
      }
      if (error instanceof Error) {
        errors.push(`Error in transaction at index ${index}: ${error.message}`)
      }
    }
  }

  return {
    transactions: transactionsFromSearchParams,
    ...(errors.length > 0 ? { errors } : {}),
  }
}
