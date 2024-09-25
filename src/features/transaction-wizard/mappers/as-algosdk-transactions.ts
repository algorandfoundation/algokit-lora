import algosdk from 'algosdk'
import {
  BuildTransactionResult,
  BuildAppCallTransactionResult,
  BuildableTransactionType,
  BuildPaymentTransactionResult,
  BuildAssetTransferTransactionResult,
  BuildAssetOptInTransactionResult,
  BuildAssetOptOutTransactionResult,
  BuildAssetRevokeTransactionResult,
} from '@/features/transaction-wizard/models'
import { invariant } from '@/utils/invariant'
import { algos } from '@algorandfoundation/algokit-utils'
import { algorandClient } from '@/features/common/data/algo-client'
import Decimal from 'decimal.js'
import { AppCallMethodCall } from '@algorandfoundation/algokit-utils/types/composer'

export const asAlgosdkTransactions = async (transaction: BuildTransactionResult): Promise<algosdk.Transaction[]> => {
  if (transaction.type === BuildableTransactionType.Payment) {
    return [await asPaymentTransaction(transaction)]
  }
  if (transaction.type === BuildableTransactionType.AppCall && transaction.method) {
    return await asMethodCallTransaction(transaction)
  }
  if (
    transaction.type === BuildableTransactionType.AssetTransfer ||
    transaction.type === BuildableTransactionType.AssetOptIn ||
    transaction.type === BuildableTransactionType.AssetOptOut ||
    transaction.type === BuildableTransactionType.AssetRevoke
  ) {
    return [await asAssetTransferTransaction(transaction)]
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

const asAppCallMethodCall = async (transaction: BuildAppCallTransactionResult): Promise<AppCallMethodCall> => {
  invariant(transaction.method, 'Method is required')
  invariant(transaction.methodArgs, 'Method args are required')

  const args = await Promise.all(
    transaction.methodArgs.map(async (arg) => {
      if (typeof arg === 'object' && 'type' in arg) {
        if (arg.type !== BuildableTransactionType.AppCall) {
          // Other transaction types only return 1 transaction
          return (await asAlgosdkTransactions(arg as BuildTransactionResult))[0]
        } else {
          return asAppCallMethodCall(arg as BuildAppCallTransactionResult)
        }
      }
      return arg
    })
  )

  return {
    sender: transaction.sender,
    appId: BigInt(transaction.applicationId), // TODO: PD - handle bigint
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

const asMethodCallTransaction = async (transaction: BuildAppCallTransactionResult): Promise<algosdk.Transaction[]> => {
  const params = await asAppCallMethodCall(transaction)
  const result = await algorandClient.transactions.appCallMethodCall(params)
  return result.transactions
}

const asAssetTransferTransaction = async (
  transaction:
    | BuildAssetTransferTransactionResult
    | BuildAssetOptInTransactionResult
    | BuildAssetOptOutTransactionResult
    | BuildAssetRevokeTransactionResult
): Promise<algosdk.Transaction> => {
  invariant(transaction.asset.decimals, 'Asset decimals is required')
  // TODO: NC - Confirm the clawback info before sending the transaction
  // TODO: NC - Check the conversion from decimal to number to bigint, can we simplify?
  const amount =
    'amount' in transaction ? BigInt(new Decimal(transaction.amount).mul(new Decimal(10).pow(transaction.asset.decimals)).toNumber()) : 0n
  return await algorandClient.transactions.assetTransfer({
    sender: transaction.sender,
    receiver: 'receiver' in transaction ? transaction.receiver : transaction.sender,
    clawbackTarget: 'assetSender' in transaction ? transaction.assetSender : undefined,
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
