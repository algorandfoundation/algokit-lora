import {
  BaseSearchParamTransaction,
  BuildableTransactionType,
  BuildKeyRegistrationTransactionResult,
  BuildTransactionResult,
} from '../models'
import { formSchema as _keyRegistrationFormSchema } from '../components/key-registration-transaction-builder'
import { z } from 'zod'
import { randomGuid } from '@/utils/random-guid'

// This is a workaround to make the online field a boolean instead of a string.
// A string type is used in the form schema because of the value of radio buttons cant be boolean
const keyRegistrationFormSchema = _keyRegistrationFormSchema.innerType().extend({
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
  fee: params.fee ? { setAutomatically: false, value: Number(params.fee) } : { setAutomatically: true },
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
      if (searchParamTransaction.type === 'keyreg') {
        const keyRegTransaction = transformKeyRegistrationTransaction(searchParamTransaction)
        keyRegistrationFormSchema.parse(keyRegTransaction)
        transactionsFromSearchParams.push(keyRegTransaction)
      }
      // TODO: Add other transaction types
    } catch (error) {
      if (error instanceof z.ZodError) {
        const badPaths = error.errors.map((e) => e.path.join('-'))
        errors.push(`Error in transaction ${index} in the following fields: ${badPaths.join(', ')}`)
        continue
      }
      if (error instanceof Error) {
        errors.push(`Error in transaction ${index}: ${error.message}`)
      }
    }
  }

  return {
    transactions: transactionsFromSearchParams,
    ...(errors.length > 0 ? { errors } : {}),
  }
}
