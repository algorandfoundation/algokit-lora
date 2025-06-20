import {
  BaseSearchParamTransaction,
  BuildableTransactionType,
  BuildAssetCreateTransactionResult,
  BuildKeyRegistrationTransactionResult,
  BuildPaymentTransactionResult,
  BuildTransactionResult,
} from '../models'
import { keyRegistrationFormSchema } from '../components/key-registration-transaction-builder'
import { paymentFormSchema } from '../components/payment-transaction-builder'
import { assetCreateFormSchema } from '../components/asset-create-transaction-builder'
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

const transformPaymentTransaction = (params: BaseSearchParamTransaction): BuildPaymentTransactionResult => ({
  id: randomGuid(),
  type: BuildableTransactionType.Payment,
  sender: {
    value: params.sender,
    resolvedAddress: params.sender,
  },
  receiver: {
    value: params.receiver,
    resolvedAddress: params.receiver,
  },
  amount: microAlgo(Number(params.amount)).algo,
  fee: params.fee ? { setAutomatically: false, value: microAlgo(Number(params.fee)).algo } : { setAutomatically: true },
  validRounds: {
    setAutomatically: true,
    firstValid: undefined,
    lastValid: undefined,
  },
  note: params.note,
})

const defaultOptionalAddress = {
  value: '',
  resolvedAddress: '',
}
const transformAssetCreateTransaction = (params: BaseSearchParamTransaction): BuildAssetCreateTransactionResult => ({
  id: randomGuid(),
  type: BuildableTransactionType.AssetCreate,
  sender: {
    value: params.sender,
    resolvedAddress: params.sender,
  },
  total: BigInt(params.total),
  decimals: Number(params.decimals),
  assetName: params.assetname,
  unitName: params.unitname,
  url: params.url,
  metadataHash: params.metadatahash,
  defaultFrozen: params.defaultfrozen === 'true',
  manager: params.manager
    ? {
        value: params.manager,
        resolvedAddress: params.manager,
      }
    : defaultOptionalAddress,
  reserve: params.reserve
    ? {
        value: params.reserve,
        resolvedAddress: params.reserve,
      }
    : defaultOptionalAddress,
  freeze: params.freeze
    ? {
        value: params.freeze,
        resolvedAddress: params.freeze,
      }
    : defaultOptionalAddress,
  clawback: params.clawback
    ? {
        value: params.clawback,
        resolvedAddress: params.clawback,
      }
    : defaultOptionalAddress,
  fee: params.fee ? { setAutomatically: false, value: microAlgo(Number(params.fee)).algo } : { setAutomatically: true },
  validRounds: {
    setAutomatically: true,
    firstValid: undefined,
    lastValid: undefined,
  },
  note: params.note,
})

const transformationConfigByTransactionType = {
  [algosdk.TransactionType.keyreg]: {
    transform: transformKeyRegistrationTransaction,
    schema: keyRegFormSchema,
  },
  [algosdk.TransactionType.pay]: {
    transform: transformPaymentTransaction,
    schema: paymentFormSchema,
  },
  [algosdk.TransactionType.acfg]: {
    transform: transformAssetCreateTransaction,
    schema: assetCreateFormSchema,
  },
  // TODO: Add other transaction types
}

export function transformSearchParamsTransactions(searchParamTransactions: BaseSearchParamTransaction[]) {
  const transactionsFromSearchParams: BuildTransactionResult[] = []
  const errors: string[] = []
  for (const [index, searchParamTransaction] of searchParamTransactions.entries()) {
    if (!(searchParamTransaction.type in transformationConfigByTransactionType)) {
      continue // Skip transactions with unsupported types
    }
    const { transform, schema } =
      transformationConfigByTransactionType[searchParamTransaction.type as keyof typeof transformationConfigByTransactionType]
    try {
      const transaction = transform(searchParamTransaction)
      schema.parse(transaction)
      transactionsFromSearchParams.push(transaction)
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
