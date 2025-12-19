import { ABITransactionType } from '@algorandfoundation/algokit-utils/abi'
import {
  BuildTransactionResult,
  BuildAppCallTransactionResult,
  BuildableTransactionType,
  BuildPaymentTransactionResult,
  BuildAssetTransferTransactionResult,
  BuildAssetOptInTransactionResult,
  BuildAssetOptOutTransactionResult,
  BuildAssetClawbackTransactionResult,
  BuildAssetCreateTransactionResult,
  BuildAssetReconfigureTransactionResult,
  BuildAssetDestroyTransactionResult,
  BuildMethodCallTransactionResult,
  BuildAccountCloseTransactionResult,
  BuildAssetFreezeTransactionResult,
  BuildKeyRegistrationTransactionResult,
  BuildApplicationCreateTransactionResult,
  BuildApplicationUpdateTransactionResult,
} from '@/features/transaction-wizard/models'
import { invariant } from '@/utils/invariant'
import { algos } from '@algorandfoundation/algokit-utils'
import { algorandClient } from '@/features/common/data/algo-client'
import {
  AppCallMethodCall,
  AppCallParams,
  AppCreateParams,
  AppUpdateParams,
  AssetConfigParams,
  AssetCreateParams,
  AssetDestroyParams,
  AssetFreezeParams,
  AssetTransferParams,
  OfflineKeyRegistrationParams,
  OnlineKeyRegistrationParams,
  PaymentParams,
} from '@algorandfoundation/algokit-utils/types/composer'
import { Transaction } from '@algorandfoundation/algokit-utils/transact'
import { base64ToBytes } from '@/utils/base64-to-bytes'
import { Buffer } from 'buffer'
import Decimal from 'decimal.js'

export const asAlgosdkTransactions = async (transaction: BuildTransactionResult): Promise<Transaction[]> => {
  if (transaction.type === BuildableTransactionType.Payment || transaction.type === BuildableTransactionType.AccountClose) {
    return [await asPaymentTransaction(transaction)]
  }
  if (
    transaction.type === BuildableTransactionType.AssetTransfer ||
    transaction.type === BuildableTransactionType.AssetOptIn ||
    transaction.type === BuildableTransactionType.AssetOptOut ||
    transaction.type === BuildableTransactionType.AssetClawback
  ) {
    return [await asAssetTransferTransaction(transaction)]
  }
  if (transaction.type === BuildableTransactionType.AssetCreate) {
    return [await asAssetCreateTransaction(transaction)]
  }
  if (transaction.type === BuildableTransactionType.AssetReconfigure) {
    return [await asAssetReconfigureTransaction(transaction)]
  }
  if (transaction.type === BuildableTransactionType.AssetDestroy) {
    return [await asAssetDestroyTransaction(transaction)]
  }
  if (transaction.type === BuildableTransactionType.AssetFreeze) {
    return [await asAssetFreezeTransaction(transaction)]
  }
  if (transaction.type === BuildableTransactionType.KeyRegistration) {
    return [await asKeyRegistrationTransaction(transaction)]
  }
  if (transaction.type === BuildableTransactionType.MethodCall) {
    return await asMethodCallTransactions(transaction)
  }
  if (transaction.type === BuildableTransactionType.AppCall) {
    return [await asAppCallTransaction(transaction)]
  }
  if (transaction.type === BuildableTransactionType.ApplicationCreate) {
    return [await asApplicationCreateTransaction(transaction)]
  }
  if (transaction.type === BuildableTransactionType.ApplicationUpdate) {
    return [await asApplicationUpdateTransaction(transaction)]
  }

  throw new Error('Unsupported transaction type')
}

export const asPaymentTransactionParams = (
  transaction: BuildPaymentTransactionResult | BuildAccountCloseTransactionResult
): PaymentParams => {
  return {
    sender: transaction.sender.resolvedAddress,
    receiver: transaction.receiver ? transaction.receiver.resolvedAddress : transaction.sender.resolvedAddress,
    closeRemainderTo: 'closeRemainderTo' in transaction ? transaction.closeRemainderTo.resolvedAddress : undefined,
    amount: algos(transaction.amount ?? 0),
    note: transaction.note,
    ...asFee(transaction.fee),
    ...asValidRounds(transaction.validRounds),
  }
}
const asPaymentTransaction = async (
  transaction: BuildPaymentTransactionResult | BuildAccountCloseTransactionResult
): Promise<Transaction> => {
  const params = asPaymentTransactionParams(transaction)
  return await algorandClient.createTransaction.payment(params)
}

export const asMethodCallParams = async (transaction: BuildMethodCallTransactionResult): Promise<AppCallMethodCall> => {
  invariant(transaction.methodDefinition, 'Method is required')
  invariant(transaction.methodArgs, 'Method args are required')

  const args = await Promise.all(
    transaction.methodArgs.map(async (arg) => {
      if (typeof arg === 'object' && 'type' in arg) {
        if (arg.type === BuildableTransactionType.Fulfilled || arg.type === BuildableTransactionType.Placeholder) {
          return undefined
        } else if (arg.type !== BuildableTransactionType.MethodCall) {
          // Other transaction types only return 1 transaction
          return (await asAlgosdkTransactions(arg))[0]
        } else {
          return await asMethodCallParams(arg)
        }
      }
      return arg
    })
  )

  return {
    sender: transaction.sender.resolvedAddress,
    appId: BigInt(transaction.applicationId),
    method: transaction.methodDefinition.abiMethod as unknown as import('@algorandfoundation/algokit-utils/abi').ABIMethod,
    args: args as unknown as import('@algorandfoundation/algokit-utils/types/composer').AppMethodCall<import('@algorandfoundation/algokit-utils/types/composer').AppMethodCallParams>['args'],
    accountReferences: transaction.accounts ?? [],
    appReferences: transaction.foreignApps?.map((app) => BigInt(app)) ?? [],
    assetReferences: transaction.foreignAssets?.map((asset) => BigInt(asset)) ?? [],
    boxReferences:
      transaction.boxes?.map(([appId, boxName]) => {
        return { appId: BigInt(appId), name: Uint8Array.from(Buffer.from(boxName, 'base64')) }
      }) ?? [],
    note: transaction.note,
    ...asFee(transaction.fee),
    ...asValidRounds(transaction.validRounds),
  }
}

const asMethodCallTransactions = async (transaction: BuildMethodCallTransactionResult): Promise<Transaction[]> => {
  const params = await asMethodCallParams(transaction)
  const result = await algorandClient.client
    .getAppClientById({
      appId: BigInt(transaction.applicationId),
      appSpec: transaction.appSpec,
    })
    .createTransaction.call({
      ...params,
      method: transaction.methodDefinition.name,
      onComplete: transaction.onComplete,
    })

  return result.transactions
}

export const asAppCallTransactionParams = (transaction: BuildAppCallTransactionResult): AppCallParams => {
  return {
    sender: transaction.sender.resolvedAddress,
    appId: BigInt(transaction.applicationId),
    args: transaction.args.map((arg) => base64ToBytes(arg)),
    onComplete: transaction.onComplete,
    accountReferences: transaction.accounts ?? [],
    appReferences: transaction.foreignApps?.map((app) => BigInt(app)) ?? [],
    assetReferences: transaction.foreignAssets?.map((asset) => BigInt(asset)) ?? [],
    boxReferences:
      transaction.boxes?.map(([appId, boxName]) => {
        return { appId: BigInt(appId), name: Uint8Array.from(Buffer.from(boxName, 'base64')) }
      }) ?? [],
    note: transaction.note,
    ...asFee(transaction.fee),
    ...asValidRounds(transaction.validRounds),
  }
}
const asAppCallTransaction = async (transaction: BuildAppCallTransactionResult): Promise<Transaction> => {
  const params = asAppCallTransactionParams(transaction)
  return await algorandClient.createTransaction.appCall(params)
}

export const asApplicationCreateTransactionParams = (transaction: BuildApplicationCreateTransactionResult): AppCreateParams => {
  return {
    sender: transaction.sender.resolvedAddress,
    args: transaction.args.map((arg) => base64ToBytes(arg)),
    onComplete: transaction.onComplete,
    approvalProgram: base64ToBytes(transaction.approvalProgram),
    clearStateProgram: base64ToBytes(transaction.clearStateProgram),
    schema: {
      globalInts: transaction.globalInts ?? 0,
      globalByteSlices: transaction.globalByteSlices ?? 0,
      localInts: transaction.localInts ?? 0,
      localByteSlices: transaction.localByteSlices ?? 0,
    },
    extraProgramPages: transaction.extraProgramPages,
    note: transaction.note,
    ...asFee(transaction.fee),
    ...asValidRounds(transaction.validRounds),
  }
}

const asApplicationCreateTransaction = async (transaction: BuildApplicationCreateTransactionResult): Promise<Transaction> => {
  const params = asApplicationCreateTransactionParams(transaction)
  return await algorandClient.createTransaction.appCreate(params)
}

export const asApplicationUpdateTransactionParams = (transaction: BuildApplicationUpdateTransactionResult): AppUpdateParams => {
  return {
    sender: transaction.sender.resolvedAddress,
    appId: BigInt(transaction.applicationId),
    args: transaction.args.map((arg) => base64ToBytes(arg)),
    approvalProgram: base64ToBytes(transaction.approvalProgram),
    clearStateProgram: base64ToBytes(transaction.clearStateProgram),
    note: transaction.note,
    ...asFee(transaction.fee),
    ...asValidRounds(transaction.validRounds),
  }
}

const asApplicationUpdateTransaction = async (transaction: BuildApplicationUpdateTransactionResult): Promise<Transaction> => {
  const params = asApplicationUpdateTransactionParams(transaction)
  return await algorandClient.createTransaction.appUpdate(params)
}

export const asAssetTransferTransactionParams = (
  transaction:
    | BuildAssetTransferTransactionResult
    | BuildAssetOptInTransactionResult
    | BuildAssetOptOutTransactionResult
    | BuildAssetClawbackTransactionResult
): AssetTransferParams => {
  invariant(transaction.asset.decimals !== undefined, 'Asset decimals is required')
  let amount = 0n
  if ('amount' in transaction && transaction.amount.gt(0)) {
    const convertedAmount = transaction.amount.mul(new Decimal(10).pow(transaction.asset.decimals))
    if (!convertedAmount.isInteger()) {
      throw new Error('Asset transfer failed to convert to the lowest unit')
    }
    amount = BigInt(convertedAmount.toString())
  }
  return {
    sender: transaction.sender.resolvedAddress,
    receiver: 'receiver' in transaction ? transaction.receiver.resolvedAddress : transaction.sender.resolvedAddress,
    clawbackTarget: 'clawbackTarget' in transaction ? transaction.clawbackTarget.resolvedAddress : undefined,
    closeAssetTo: 'closeRemainderTo' in transaction ? transaction.closeRemainderTo.resolvedAddress : undefined,
    assetId: BigInt(transaction.asset.id),
    amount,
    note: transaction.note,
    ...asFee(transaction.fee),
    ...asValidRounds(transaction.validRounds),
  }
}
const asAssetTransferTransaction = async (
  transaction:
    | BuildAssetTransferTransactionResult
    | BuildAssetOptInTransactionResult
    | BuildAssetOptOutTransactionResult
    | BuildAssetClawbackTransactionResult
): Promise<Transaction> => {
  if (
    transaction.type === BuildableTransactionType.AssetClawback &&
    (!transaction.asset.clawback || transaction.sender.resolvedAddress !== transaction.asset.clawback)
  ) {
    throw new Error('Invalid clawback transaction')
  }

  const params = asAssetTransferTransactionParams(transaction)
  return await algorandClient.createTransaction.assetTransfer(params)
}

export const asAssetCreateTransactionParams = (transaction: BuildAssetCreateTransactionResult): AssetCreateParams => {
  return {
    sender: transaction.sender.resolvedAddress,
    total: transaction.total,
    decimals: transaction.decimals,
    assetName: transaction.assetName,
    unitName: transaction.unitName,
    url: transaction.url,
    metadataHash: transaction.metadataHash ? new Uint8Array(Buffer.from(transaction.metadataHash, 'base64')) : undefined,
    defaultFrozen: transaction.defaultFrozen,
    manager: transaction.manager ? transaction.manager.resolvedAddress : undefined,
    reserve: transaction.reserve ? transaction.reserve.resolvedAddress : undefined,
    freeze: transaction.freeze ? transaction.freeze.resolvedAddress : undefined,
    clawback: transaction.clawback ? transaction.clawback.resolvedAddress : undefined,
    note: transaction.note,
    ...asFee(transaction.fee),
    ...asValidRounds(transaction.validRounds),
  }
}
const asAssetCreateTransaction = async (transaction: BuildAssetCreateTransactionResult): Promise<Transaction> => {
  const params = asAssetCreateTransactionParams(transaction)
  return await algorandClient.createTransaction.assetCreate(params)
}

const asAssetReconfigureTransactionParams = (transaction: BuildAssetReconfigureTransactionResult): AssetConfigParams => {
  return {
    sender: transaction.sender.resolvedAddress,
    assetId: BigInt(transaction.asset.id),
    manager: transaction.manager ? transaction.manager.resolvedAddress : undefined,
    reserve: transaction.reserve ? transaction.reserve.resolvedAddress : undefined,
    freeze: transaction.freeze ? transaction.freeze.resolvedAddress : undefined,
    clawback: transaction.clawback ? transaction.clawback.resolvedAddress : undefined,
    note: transaction.note,
    ...asFee(transaction.fee),
    ...asValidRounds(transaction.validRounds),
  }
}
const asAssetReconfigureTransaction = async (transaction: BuildAssetReconfigureTransactionResult): Promise<Transaction> => {
  const params = asAssetReconfigureTransactionParams(transaction)
  return await algorandClient.createTransaction.assetConfig(params)
}

const asAssetDestroyTransactionParams = (transaction: BuildAssetDestroyTransactionResult): AssetDestroyParams => {
  return {
    sender: transaction.sender.resolvedAddress,
    assetId: BigInt(transaction.asset.id),
  }
}
const asAssetDestroyTransaction = async (transaction: BuildAssetDestroyTransactionResult): Promise<Transaction> => {
  const params = asAssetDestroyTransactionParams(transaction)
  return await algorandClient.createTransaction.assetDestroy(params)
}

export const asAssetConfigTransactionParams = (
  transaction: BuildAssetCreateTransactionResult | BuildAssetReconfigureTransactionResult | BuildAssetDestroyTransactionResult
): AssetCreateParams | AssetConfigParams | AssetDestroyParams => {
  switch (transaction.type) {
    case BuildableTransactionType.AssetCreate:
      return asAssetCreateTransactionParams(transaction)
    case BuildableTransactionType.AssetReconfigure:
      return asAssetReconfigureTransactionParams(transaction)
    case BuildableTransactionType.AssetDestroy:
      return asAssetDestroyTransactionParams(transaction)
    default:
      throw new Error('Unsupported transaction type')
  }
}

export const asAssetFreezeTransactionParams = (transaction: BuildAssetFreezeTransactionResult): AssetFreezeParams => {
  return {
    sender: transaction.sender.resolvedAddress,
    assetId: BigInt(transaction.asset.id),
    freezeTarget: transaction.freezeTarget.resolvedAddress,
    frozen: transaction.frozen,
    note: transaction.note,
    ...asFee(transaction.fee),
    ...asValidRounds(transaction.validRounds),
  }
}
const asAssetFreezeTransaction = async (transaction: BuildAssetFreezeTransactionResult): Promise<Transaction> => {
  if (!transaction.asset.freeze || transaction.sender.resolvedAddress !== transaction.asset.freeze) {
    throw new Error('Invalid freeze transaction')
  }

  const params = asAssetFreezeTransactionParams(transaction)
  return await algorandClient.createTransaction.assetFreeze(params)
}

export const asKeyRegistrationTransactionParams = (
  transaction: BuildKeyRegistrationTransactionResult
): OnlineKeyRegistrationParams | OfflineKeyRegistrationParams => {
  if (transaction.online) {
    invariant(transaction.voteKey, 'Vote key is required')
    invariant(transaction.selectionKey, 'Selection key is required')
    invariant(transaction.stateProofKey, 'State proof key is required')

    return {
      sender: transaction.sender.resolvedAddress,
      voteKey: Uint8Array.from(Buffer.from(transaction.voteKey, 'base64')),
      selectionKey: Uint8Array.from(Buffer.from(transaction.selectionKey, 'base64')),
      stateProofKey: Uint8Array.from(Buffer.from(transaction.stateProofKey, 'base64')),
      voteFirst: transaction.voteFirstValid ? transaction.voteFirstValid : 0n,
      voteLast: transaction.voteLastValid ? transaction.voteLastValid : 0n,
      voteKeyDilution: transaction.voteKeyDilution ? transaction.voteKeyDilution : 0n,
      note: transaction.note,
      ...asFee(transaction.fee),
      ...asValidRounds(transaction.validRounds),
    }
  }

  return {
    sender: transaction.sender.resolvedAddress,
  }
}

const asKeyRegistrationTransaction = async (transaction: BuildKeyRegistrationTransactionResult): Promise<Transaction> => {
  const params = asKeyRegistrationTransactionParams(transaction)

  return await ('voteKey' in params
    ? algorandClient.createTransaction.onlineKeyRegistration(params)
    : algorandClient.createTransaction.offlineKeyRegistration(params))
}

const asFee = (fee: BuildAssetCreateTransactionResult['fee']) =>
  !fee.setAutomatically && fee.value != null ? { staticFee: algos(fee.value) } : undefined

const asValidRounds = (validRounds: BuildAssetCreateTransactionResult['validRounds']) =>
  !validRounds.setAutomatically && validRounds.firstValid && validRounds.lastValid
    ? {
        firstValidRound: validRounds.firstValid,
        lastValidRound: validRounds.lastValid,
      }
    : undefined

export const asAbiTransactionType = (type: BuildableTransactionType) => {
  switch (type) {
    case BuildableTransactionType.Payment:
    case BuildableTransactionType.AccountClose:
      return ABITransactionType.Payment
    case BuildableTransactionType.AppCall:
    case BuildableTransactionType.MethodCall:
    case BuildableTransactionType.ApplicationCreate:
    case BuildableTransactionType.ApplicationUpdate:
      return ABITransactionType.AppCall
    case BuildableTransactionType.AssetOptIn:
    case BuildableTransactionType.AssetOptOut:
    case BuildableTransactionType.AssetTransfer:
    case BuildableTransactionType.AssetClawback:
      return ABITransactionType.AssetTransfer
    case BuildableTransactionType.AssetCreate:
    case BuildableTransactionType.AssetReconfigure:
    case BuildableTransactionType.AssetDestroy:
      return ABITransactionType.AssetConfig
    case BuildableTransactionType.AssetFreeze:
      return ABITransactionType.AssetFreeze
    case BuildableTransactionType.KeyRegistration:
      return ABITransactionType.KeyRegistration
    default:
      return ABITransactionType.Txn
  }
}
