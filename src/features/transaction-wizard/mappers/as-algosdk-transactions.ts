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
} from '@/features/transaction-wizard/models'
import { invariant } from '@/utils/invariant'
import { algos } from '@algorandfoundation/algokit-utils'
import { algorandClient } from '@/features/common/data/algo-client'
import Decimal from 'decimal.js'
import { AppCallMethodCall } from '@algorandfoundation/algokit-utils/types/composer'
import { base64ToBytes } from '@/utils/base64-to-bytes'

export const asAlgosdkTransactions = async (transaction: BuildTransactionResult): Promise<algosdk.Transaction[]> => {
  if (transaction.type === BuildableTransactionType.Payment) {
    return [await asPaymentTransaction(transaction)]
  }
  if (transaction.type === BuildableTransactionType.MethodCall) {
    return await asMethodCallTransaction(transaction)
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

  if (transaction.type === BuildableTransactionType.AppCall) {
    return [await asAppCallTransaction(transaction)]
  }

  throw new Error('Unsupported transaction type')
}

const asPaymentTransaction = async (transaction: BuildPaymentTransactionResult): Promise<algosdk.Transaction> => {
  return await algorandClient.transactions.payment({
    sender: transaction.sender,
    receiver: transaction.receiver,
    amount: algos(transaction.amount),
    note: transaction.note,
    ...(!transaction.fee.setAutomatically && transaction.fee.value ? { staticFee: algos(transaction.fee.value) } : undefined),
    ...(!transaction.validRounds.setAutomatically && transaction.validRounds.firstValid && transaction.validRounds.lastValid
      ? {
          firstValidRound: transaction.validRounds.firstValid,
          lastValidRound: transaction.validRounds.lastValid,
        }
      : undefined),
  })
}

const asMethodCallParams = async (transaction: BuildMethodCallTransactionResult): Promise<AppCallMethodCall> => {
  invariant(transaction.method, 'Method is required')
  invariant(transaction.methodArgs, 'Method args are required')

  const args = await Promise.all(
    transaction.methodArgs.map(async (arg) => {
      if (typeof arg === 'object' && 'type' in arg) {
        if (arg.type !== BuildableTransactionType.MethodCall) {
          // Other transaction types only return 1 transaction
          return (await asAlgosdkTransactions(arg as BuildTransactionResult))[0]
        } else {
          return asMethodCallParams(arg as BuildMethodCallTransactionResult)
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
    note: transaction.note,
    ...(!transaction.fee.setAutomatically && transaction.fee.value ? { staticFee: algos(transaction.fee.value) } : undefined),
    ...(!transaction.validRounds.setAutomatically && transaction.validRounds.firstValid && transaction.validRounds.lastValid
      ? {
          firstValidRound: transaction.validRounds.firstValid,
          lastValidRound: transaction.validRounds.lastValid,
        }
      : undefined),
    accountReferences: transaction.accounts ?? [],
    appReferences: transaction.foreignApps?.map((app) => BigInt(app)) ?? [],
    assetReferences: transaction.foreignAssets?.map((asset) => BigInt(asset)) ?? [],
    boxReferences: transaction.boxes ?? [],
  }
}

const asMethodCallTransaction = async (transaction: BuildMethodCallTransactionResult): Promise<algosdk.Transaction[]> => {
  const params = await asMethodCallParams(transaction)
  const result = await algorandClient.transactions.appCallMethodCall(params)
  return result.transactions
}

const asAppCallTransaction = async (transaction: BuildAppCallTransactionResult): Promise<algosdk.Transaction> => {
  return await algorandClient.transactions.appCall({
    sender: transaction.sender,
    appId: BigInt(transaction.applicationId),
    args: transaction.args.map((arg) => base64ToBytes(arg)),
    note: transaction.note,
    ...(!transaction.fee.setAutomatically && transaction.fee.value ? { staticFee: algos(transaction.fee.value) } : undefined),
    ...(!transaction.validRounds.setAutomatically && transaction.validRounds.firstValid && transaction.validRounds.lastValid
      ? {
          firstValidRound: transaction.validRounds.firstValid,
          lastValidRound: transaction.validRounds.lastValid,
        }
      : undefined),
    onComplete: transaction.onComplete,
    accountReferences: transaction.accounts ?? [],
    appReferences: transaction.foreignApps?.map((app) => BigInt(app)) ?? [],
    assetReferences: transaction.foreignAssets?.map((asset) => BigInt(asset)) ?? [],
    boxReferences: transaction.boxes ?? [],
  })
}

const asAssetTransferTransaction = async (
  transaction:
    | BuildAssetTransferTransactionResult
    | BuildAssetOptInTransactionResult
    | BuildAssetOptOutTransactionResult
    | BuildAssetClawbackTransactionResult
): Promise<algosdk.Transaction> => {
  invariant(transaction.asset.decimals, 'Asset decimals is required')
  // TODO: NC - Check the conversion from decimal to number to bigint, can we simplify?

  if (
    transaction.type === BuildableTransactionType.AssetClawback &&
    (!transaction.asset.clawback || transaction.sender !== transaction.asset.clawback)
  ) {
    throw new Error('Invalid clawback transaction')
  }

  const amount =
    'amount' in transaction ? BigInt(new Decimal(transaction.amount).mul(new Decimal(10).pow(transaction.asset.decimals)).toNumber()) : 0n

  return await algorandClient.transactions.assetTransfer({
    sender: transaction.sender,
    receiver: 'receiver' in transaction ? transaction.receiver : transaction.sender,
    clawbackTarget: 'clawbackTarget' in transaction ? transaction.clawbackTarget : undefined,
    closeAssetTo: 'closeRemainderTo' in transaction ? transaction.closeRemainderTo : undefined,
    assetId: BigInt(transaction.asset.id),
    amount,
    note: transaction.note,
    ...(!transaction.fee.setAutomatically && transaction.fee.value ? { staticFee: algos(transaction.fee.value) } : undefined),
    ...(!transaction.validRounds.setAutomatically && transaction.validRounds.firstValid && transaction.validRounds.lastValid
      ? {
          firstValidRound: transaction.validRounds.firstValid,
          lastValidRound: transaction.validRounds.lastValid,
        }
      : undefined),
  })
}

const asAssetCreateTransaction = async (transaction: BuildAssetCreateTransactionResult): Promise<algosdk.Transaction> => {
  return await algorandClient.transactions.assetCreate({
    sender: transaction.sender,
    total: transaction.total,
    decimals: transaction.decimals,
    assetName: transaction.assetName,
    unitName: transaction.unitName,
    url: transaction.url,
    metadataHash: transaction.metadataHash,
    defaultFrozen: transaction.defaultFrozen,
    manager: transaction.manager,
    reserve: transaction.reserve,
    freeze: transaction.freeze,
    clawback: transaction.clawback,
    note: transaction.note,
    ...(!transaction.fee.setAutomatically && transaction.fee.value ? { staticFee: algos(transaction.fee.value) } : undefined),
    ...(!transaction.validRounds.setAutomatically && transaction.validRounds.firstValid && transaction.validRounds.lastValid
      ? {
          firstValidRound: transaction.validRounds.firstValid,
          lastValidRound: transaction.validRounds.lastValid,
        }
      : undefined),
  })
}

const asAssetReconfigureTransaction = async (transaction: BuildAssetReconfigureTransactionResult): Promise<algosdk.Transaction> => {
  return algorandClient.transactions.assetConfig({
    sender: transaction.sender,
    assetId: BigInt(transaction.asset.id),
    manager: transaction.sender,
  })
}

const asAssetDestroyTransaction = async (transaction: BuildAssetDestroyTransactionResult): Promise<algosdk.Transaction> => {
  return algorandClient.transactions.assetDestroy({
    sender: transaction.sender,
    assetId: BigInt(transaction.asset.id),
  })
}
