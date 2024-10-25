import algosdk from 'algosdk'
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
} from '@/features/transaction-wizard/models'
import { invariant } from '@/utils/invariant'
import { algos } from '@algorandfoundation/algokit-utils'
import { algorandClient } from '@/features/common/data/algo-client'
import {
  AppCallMethodCall,
  AppCallParams,
  AssetConfigParams,
  AssetCreateParams,
  AssetDestroyParams,
  AssetFreezeParams,
  AssetTransferParams,
  OnlineKeyRegistrationParams,
  PaymentParams,
} from '@algorandfoundation/algokit-utils/types/composer'
import { base64ToBytes } from '@/utils/base64-to-bytes'
import { AppSpec } from '@algorandfoundation/algokit-utils/types/app-spec'
import { Buffer } from 'buffer'

export const asAlgosdkTransactions = async (transaction: BuildTransactionResult): Promise<algosdk.Transaction[]> => {
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

  throw new Error('Unsupported transaction type')
}

export const asPaymentTransactionParams = (
  transaction: BuildPaymentTransactionResult | BuildAccountCloseTransactionResult
): PaymentParams => {
  return {
    sender: transaction.sender,
    receiver: transaction.receiver ?? transaction.sender,
    closeRemainderTo: 'closeRemainderTo' in transaction ? transaction.closeRemainderTo : undefined,
    amount: algos(transaction.amount ?? 0),
    note: transaction.note,
    ...asFee(transaction.fee),
    ...asValidRounds(transaction.validRounds),
  }
}
const asPaymentTransaction = async (
  transaction: BuildPaymentTransactionResult | BuildAccountCloseTransactionResult
): Promise<algosdk.Transaction> => {
  const params = asPaymentTransactionParams(transaction)
  return await algorandClient.createTransaction.payment(params)
}

export const asMethodCallParams = async (transaction: BuildMethodCallTransactionResult): Promise<AppCallMethodCall> => {
  invariant(transaction.method, 'Method is required')
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
    sender: transaction.sender,
    appId: BigInt(transaction.applicationId),
    method: transaction.method,
    args: args,
    accountReferences: transaction.accounts ?? [],
    appReferences: transaction.foreignApps?.map((app) => BigInt(app)) ?? [],
    assetReferences: transaction.foreignAssets?.map((asset) => BigInt(asset)) ?? [],
    boxReferences: transaction.boxes ?? [],
    note: transaction.note,
    ...asFee(transaction.fee),
    ...asValidRounds(transaction.validRounds),
  }
}

const asMethodCallTransactions = async (transaction: BuildMethodCallTransactionResult): Promise<algosdk.Transaction[]> => {
  const params = await asMethodCallParams(transaction)
  const result = await algorandClient.client
    .getAppClientById({
      appId: BigInt(transaction.applicationId),
      appSpec: transaction.appSpec as AppSpec, // TODO: PD - convert Arc32AppSpec to AppSpec
    })
    .createTransaction.call({
      ...params,
      method: transaction.method.name,
      onComplete: transaction.onComplete,
    })

  return result.transactions
}

export const asAppCallTransactionParams = (transaction: BuildAppCallTransactionResult): AppCallParams => {
  return {
    sender: transaction.sender,
    appId: BigInt(transaction.applicationId),
    args: transaction.args.map((arg) => base64ToBytes(arg)),
    onComplete: transaction.onComplete,
    accountReferences: transaction.accounts ?? [],
    appReferences: transaction.foreignApps?.map((app) => BigInt(app)) ?? [],
    assetReferences: transaction.foreignAssets?.map((asset) => BigInt(asset)) ?? [],
    boxReferences: transaction.boxes ?? [],
    note: transaction.note,
    ...asFee(transaction.fee),
    ...asValidRounds(transaction.validRounds),
  }
}
const asAppCallTransaction = async (transaction: BuildAppCallTransactionResult): Promise<algosdk.Transaction> => {
  const params = asAppCallTransactionParams(transaction)
  return await algorandClient.createTransaction.appCall(params)
}

export const asAssetTransferTransactionParams = (
  transaction:
    | BuildAssetTransferTransactionResult
    | BuildAssetOptInTransactionResult
    | BuildAssetOptOutTransactionResult
    | BuildAssetClawbackTransactionResult
): AssetTransferParams => {
  invariant(transaction.asset.decimals !== undefined, 'Asset decimals is required')

  const amount = 'amount' in transaction && transaction.amount > 0 ? BigInt(transaction.amount * 10 ** transaction.asset.decimals) : 0n
  return {
    sender: transaction.sender,
    receiver: 'receiver' in transaction ? transaction.receiver : transaction.sender,
    clawbackTarget: 'clawbackTarget' in transaction ? transaction.clawbackTarget : undefined,
    closeAssetTo: 'closeRemainderTo' in transaction ? transaction.closeRemainderTo : undefined,
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
): Promise<algosdk.Transaction> => {
  if (
    transaction.type === BuildableTransactionType.AssetClawback &&
    (!transaction.asset.clawback || transaction.sender !== transaction.asset.clawback)
  ) {
    throw new Error('Invalid clawback transaction')
  }

  const params = asAssetTransferTransactionParams(transaction)
  return await algorandClient.createTransaction.assetTransfer(params)
}

export const asAssetCreateTransactionParams = (transaction: BuildAssetCreateTransactionResult): AssetCreateParams => {
  return {
    sender: transaction.sender,
    total: transaction.total,
    decimals: transaction.decimals,
    assetName: transaction.assetName,
    unitName: transaction.unitName,
    url: transaction.url,
    metadataHash: transaction.metadataHash ? new Uint8Array(Buffer.from(transaction.metadataHash, 'base64')) : undefined,
    defaultFrozen: transaction.defaultFrozen,
    manager: transaction.manager,
    reserve: transaction.reserve,
    freeze: transaction.freeze,
    clawback: transaction.clawback,
    note: transaction.note,
    ...asFee(transaction.fee),
    ...asValidRounds(transaction.validRounds),
  }
}
const asAssetCreateTransaction = async (transaction: BuildAssetCreateTransactionResult): Promise<algosdk.Transaction> => {
  const params = asAssetCreateTransactionParams(transaction)
  return await algorandClient.createTransaction.assetCreate(params)
}

const asAssetReconfigureTransactionParams = (transaction: BuildAssetReconfigureTransactionResult): AssetConfigParams => {
  return {
    sender: transaction.sender,
    assetId: BigInt(transaction.asset.id),
    manager: transaction.manager,
    reserve: transaction.reserve,
    freeze: transaction.freeze,
    clawback: transaction.clawback,
    note: transaction.note,
    ...asFee(transaction.fee),
    ...asValidRounds(transaction.validRounds),
  }
}
const asAssetReconfigureTransaction = async (transaction: BuildAssetReconfigureTransactionResult): Promise<algosdk.Transaction> => {
  const params = asAssetReconfigureTransactionParams(transaction)
  return await algorandClient.createTransaction.assetConfig(params)
}

const asAssetDestroyTransactionParams = (transaction: BuildAssetDestroyTransactionResult): AssetDestroyParams => {
  return {
    sender: transaction.sender,
    assetId: BigInt(transaction.asset.id),
  }
}
const asAssetDestroyTransaction = async (transaction: BuildAssetDestroyTransactionResult): Promise<algosdk.Transaction> => {
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
    sender: transaction.sender,
    assetId: BigInt(transaction.asset.id),
    account: transaction.freezeTarget,
    frozen: transaction.frozen,
    note: transaction.note,
    ...asFee(transaction.fee),
    ...asValidRounds(transaction.validRounds),
  }
}
const asAssetFreezeTransaction = async (transaction: BuildAssetFreezeTransactionResult): Promise<algosdk.Transaction> => {
  if (!transaction.asset.freeze || transaction.sender !== transaction.asset.freeze) {
    throw new Error('Invalid freeze transaction')
  }

  const params = asAssetFreezeTransactionParams(transaction)
  return await algorandClient.createTransaction.assetFreeze(params)
}

export const asKeyRegistrationTransactionParams = (transaction: BuildKeyRegistrationTransactionResult): OnlineKeyRegistrationParams => {
  return {
    sender: transaction.sender,
    voteKey: transaction.voteKey ? Uint8Array.from(Buffer.from(transaction.voteKey, 'base64')) : (undefined as unknown as Uint8Array),
    selectionKey: transaction.selectionKey
      ? Uint8Array.from(Buffer.from(transaction.selectionKey, 'base64'))
      : (undefined as unknown as Uint8Array),
    stateProofKey: transaction.stateProofKey
      ? Uint8Array.from(Buffer.from(transaction.stateProofKey, 'base64'))
      : (undefined as unknown as Uint8Array),
    voteFirst: transaction.voteFirstValid ? transaction.voteFirstValid : 0n,
    voteLast: transaction.voteLastValid ? transaction.voteLastValid : 0n,
    voteKeyDilution: transaction.voteKeyDilution ? transaction.voteKeyDilution : 0n,
    note: transaction.note,
    ...asFee(transaction.fee),
    ...asValidRounds(transaction.validRounds),
  }
}

const asKeyRegistrationTransaction = async (transaction: BuildKeyRegistrationTransactionResult): Promise<algosdk.Transaction> => {
  const params = asKeyRegistrationTransactionParams(transaction)
  const txn = await algorandClient.createTransaction.onlineKeyRegistration(params)

  if (!transaction.online) {
    txn.voteFirst = undefined as unknown as number
    txn.voteLast = undefined as unknown as number
    txn.voteKeyDilution = undefined as unknown as number
  }

  return txn
}

const asFee = (fee: BuildAssetCreateTransactionResult['fee']) =>
  !fee.setAutomatically && fee.value ? { staticFee: algos(fee.value) } : undefined

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
      return algosdk.ABITransactionType.pay
    case BuildableTransactionType.AppCall:
    case BuildableTransactionType.MethodCall:
      return algosdk.ABITransactionType.appl
    case BuildableTransactionType.AssetOptIn:
    case BuildableTransactionType.AssetOptOut:
    case BuildableTransactionType.AssetTransfer:
    case BuildableTransactionType.AssetClawback:
      return algosdk.ABITransactionType.axfer
    case BuildableTransactionType.AssetCreate:
    case BuildableTransactionType.AssetReconfigure:
    case BuildableTransactionType.AssetDestroy:
      return algosdk.ABITransactionType.acfg
    case BuildableTransactionType.AssetFreeze:
      return algosdk.ABITransactionType.afrz
    case BuildableTransactionType.KeyRegistration:
      return algosdk.ABITransactionType.keyreg
    default:
      return algosdk.ABITransactionType.any
  }
}
