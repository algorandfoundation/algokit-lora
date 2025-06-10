import {
  BaseSearchParamTransaction,
  BuildableTransactionType,
  BuildAssetCreateTransactionResult,
  BuildKeyRegistrationTransactionResult,
  BuildPaymentTransactionResult,
  BuildTransactionResult,
  BuildAssetOptInTransactionResult,
  BuildAssetOptOutTransactionResult,
  BuildAssetTransferTransactionResult,
  BuildAssetReconfigureTransactionResult,
  BuildAssetDestroyTransactionResult,
  BuildAssetFreezeTransactionResult,
  BuildAssetClawbackTransactionResult,
} from '../models'
import { keyRegistrationFormSchema } from '../components/key-registration-transaction-builder'
import { paymentFormSchema } from '../components/payment-transaction-builder'
import { assetCreateFormSchema } from '../components/asset-create-transaction-builder'
import { assetOptInFormSchema } from '../components/asset-opt-in-transaction-builder'
import { assetOptOutFormSchema } from '../components/asset-opt-out-transaction-builder'
import { assetTransferFormSchema } from '../components/asset-transfer-transaction-builder'
import { assetReconfigureFormSchema } from '../components/asset-reconfigure-transaction-builder'
import { assetDestroyFormSchema } from '../components/asset-destroy-transaction-builder'
import { assetFreezeFormSchema } from '../components/asset-freeze-transaction-builder'
import { assetClawbackFormSchema } from '../components/asset-clawback-transaction-builder'
import { z } from 'zod'
import { randomGuid } from '@/utils/random-guid'
import algosdk from 'algosdk'
import { microAlgo } from '@algorandfoundation/algokit-utils'
import Decimal from 'decimal.js'

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

const transformAssetOptInTransaction = (params: BaseSearchParamTransaction): BuildAssetOptInTransactionResult => ({
  id: randomGuid(),
  type: BuildableTransactionType.AssetOptIn,
  sender: {
    value: params.sender,
    resolvedAddress: params.sender,
  },
  asset: {
    id: BigInt(params.assetid),
    decimals: params.decimals ? Number(params.decimals) : undefined,
    unitName: params.unitname,
    clawback: params.clawback,
  },
  fee: params.fee ? { setAutomatically: false, value: microAlgo(Number(params.fee)).algo } : { setAutomatically: true },
  validRounds: {
    setAutomatically: true,
    firstValid: undefined,
    lastValid: undefined,
  },
  note: params.note,
})

const transformAssetOptOutTransaction = (params: BaseSearchParamTransaction): BuildAssetOptOutTransactionResult => ({
  id: randomGuid(),
  type: BuildableTransactionType.AssetOptOut,
  sender: {
    value: params.sender,
    resolvedAddress: params.sender,
  },
  asset: {
    id: BigInt(params.assetid),
    decimals: params.decimals ? Number(params.decimals) : undefined,
    unitName: params.unitname,
    clawback: params.clawback,
  },
  closeRemainderTo: {
    value: params.closeto,
    resolvedAddress: params.closeto,
  },
  fee: params.fee ? { setAutomatically: false, value: microAlgo(Number(params.fee)).algo } : { setAutomatically: true },
  validRounds: {
    setAutomatically: true,
    firstValid: undefined,
    lastValid: undefined,
  },
  note: params.note,
})

const transformAssetTransferTransaction = (params: BaseSearchParamTransaction): BuildAssetTransferTransactionResult => ({
  id: randomGuid(),
  type: BuildableTransactionType.AssetTransfer,
  sender: {
    value: params.sender,
    resolvedAddress: params.sender,
  },
  receiver: {
    value: params.receiver,
    resolvedAddress: params.receiver,
  },
  asset: {
    id: BigInt(params.assetid),
    decimals: params.decimals ? Number(params.decimals) : undefined,
    unitName: params.unitname,
    clawback: params.clawback,
  },
  amount: new Decimal(params.amount),
  fee: params.fee ? { setAutomatically: false, value: microAlgo(Number(params.fee)).algo } : { setAutomatically: true },
  validRounds: {
    setAutomatically: true,
    firstValid: undefined,
    lastValid: undefined,
  },
  note: params.note,
})

const transformAssetReconfigureTransaction = (params: BaseSearchParamTransaction): BuildAssetReconfigureTransactionResult => ({
  id: randomGuid(),
  type: BuildableTransactionType.AssetReconfigure,
  sender: {
    value: params.sender,
    resolvedAddress: params.sender,
  },
  asset: {
    id: BigInt(params.assetid),
    decimals: params.decimals ? Number(params.decimals) : undefined,
    unitName: params.unitname,
    manager: params.assetmanager,
  },
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

const transformAssetFreezeTransaction = (params: BaseSearchParamTransaction): BuildAssetFreezeTransactionResult => ({
  id: randomGuid(),
  type: BuildableTransactionType.AssetFreeze,
  sender: {
    value: params.sender,
    resolvedAddress: params.sender,
  },
  freezeTarget: {
    value: params.freezeto,
    resolvedAddress: params.freezeto,
  },
  asset: {
    id: BigInt(params.assetid),
    decimals: params.decimals ? Number(params.decimals) : undefined,
    unitName: params.unitname,
    freeze: params.assetfreeze,
  },
  frozen: params.frozen === 'true',
  fee: params.fee ? { setAutomatically: false, value: microAlgo(Number(params.fee)).algo } : { setAutomatically: true },
  validRounds: {
    setAutomatically: true,
    firstValid: undefined,
    lastValid: undefined,
  },
  note: params.note,
})

const transformAssetDestroyTransaction = (params: BaseSearchParamTransaction): BuildAssetDestroyTransactionResult => ({
  id: randomGuid(),
  type: BuildableTransactionType.AssetDestroy,
  sender: {
    value: params.sender,
    resolvedAddress: params.sender,
  },
  asset: {
    id: BigInt(params.assetid),
    decimals: params.decimals ? Number(params.decimals) : undefined,
    manager: params.assetmanager,
  },
  fee: params.fee ? { setAutomatically: false, value: microAlgo(Number(params.fee)).algo } : { setAutomatically: true },
  validRounds: {
    setAutomatically: true,
    firstValid: undefined,
    lastValid: undefined,
  },
  note: params.note,
})

const transformAssetClawbackTransaction = (params: BaseSearchParamTransaction): BuildAssetClawbackTransactionResult => ({
  id: randomGuid(),
  type: BuildableTransactionType.AssetClawback,
  sender: {
    value: params.sender,
    resolvedAddress: params.sender,
  },
  receiver: {
    value: params.receiver,
    resolvedAddress: params.receiver,
  },
  clawbackTarget: {
    value: params.clawbackfrom || params.clawbacktarget,
    resolvedAddress: params.clawbackfrom || params.clawbacktarget,
  },
  asset: {
    id: BigInt(params.assetid),
    decimals: params.decimals ? Number(params.decimals) : undefined,
    unitName: params.unitname,
    clawback: params.assetclawback,
  },
  amount: new Decimal(params.amount),
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
  [algosdk.TransactionType.axfer]: {
    transform: transformAssetOptInTransaction,
    schema: assetOptInFormSchema,
  },
  [BuildableTransactionType.AssetOptOut]: {
    transform: transformAssetOptOutTransaction,
    schema: assetOptOutFormSchema,
  },
  [BuildableTransactionType.AssetTransfer]: {
    transform: transformAssetTransferTransaction,
    schema: assetTransferFormSchema,
  },
  [BuildableTransactionType.AssetReconfigure]: {
    transform: transformAssetReconfigureTransaction,
    schema: assetReconfigureFormSchema,
  },
  [BuildableTransactionType.AssetDestroy]: {
    transform: transformAssetDestroyTransaction,
    schema: assetDestroyFormSchema,
  },
  [BuildableTransactionType.AssetFreeze]: {
    transform: transformAssetFreezeTransaction,
    schema: assetFreezeFormSchema,
  },
  [BuildableTransactionType.AssetClawback]: {
    transform: transformAssetClawbackTransaction,
    schema: assetClawbackFormSchema,
  },
  // TODO: Add other transaction types
}

export function transformSearchParamsTransactions(searchParamTransactions: BaseSearchParamTransaction[]) {
  const transactionsFromSearchParams: BuildTransactionResult[] = []
  const errors: string[] = []
  for (const [index, searchParamTransaction] of searchParamTransactions.entries()) {
    const configKey = searchParamTransaction.type
    if (!(configKey in transformationConfigByTransactionType)) {
      continue // Skip transactions with unsupported types
    }
    const { transform, schema } = transformationConfigByTransactionType[configKey as keyof typeof transformationConfigByTransactionType]
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
