import { TransactionResult } from '@/features/transactions/data/types'
import {
  AssetTransferTransaction,
  AssetTransferTransactionSubType,
  BaseAssetTransferTransaction,
  InnerAssetTransferTransaction,
  TransactionType,
} from '../models'
import { invariant } from '@/utils/invariant'
import { ZERO_ADDRESS } from '@/features/common/constants'
import { asInnerTransactionId, mapCommonTransactionProperties } from './transaction-common-properties-mappers'
import { AssetSummary } from '@/features/assets/models'
import { AsyncMaybeAtom } from '@/features/common/data/types'
import { AssetId } from '@/features/assets/data/types'

const mapSubType = (transactionResult: TransactionResult) => {
  invariant(transactionResult.assetTransferTransaction, 'asset-transfer-transaction is not set')
  const assetTransfer = transactionResult.assetTransferTransaction

  if (assetTransfer.closeTo) {
    return AssetTransferTransactionSubType.OptOut
  }

  if (transactionResult.sender === assetTransfer.receiver && assetTransfer.amount === 0n) {
    return AssetTransferTransactionSubType.OptIn
  }

  // if the assetTransfer.sender is not a ZERO address, it's a clawback
  // https://developer.algorand.org/docs/rest-apis/indexer/#transactionassettransfer
  if (assetTransfer.sender && assetTransfer.sender !== ZERO_ADDRESS && assetTransfer.receiver && assetTransfer.receiver !== ZERO_ADDRESS) {
    return AssetTransferTransactionSubType.Clawback
  }

  return undefined
}

const mapCommonAssetTransferTransactionProperties = (
  transactionResult: TransactionResult,
  assetResolver: (assetId: AssetId) => AsyncMaybeAtom<AssetSummary>
) => {
  invariant(transactionResult.assetTransferTransaction, 'asset-transfer-transaction is not set')

  const assetId = transactionResult.assetTransferTransaction.assetId
  const asset = assetResolver(assetId)

  return {
    ...mapCommonTransactionProperties(transactionResult),
    type: TransactionType.AssetTransfer,
    subType: mapSubType(transactionResult),
    assetId,
    asset,
    receiver: transactionResult.assetTransferTransaction.receiver,
    amount: transactionResult.assetTransferTransaction.amount,
    closeRemainder: transactionResult.assetTransferTransaction.closeTo
      ? {
          to: transactionResult.assetTransferTransaction.closeTo,
          amount: transactionResult.assetTransferTransaction.closeAmount ?? 0n,
        }
      : undefined,
    clawbackFrom: transactionResult.assetTransferTransaction.sender,
  } satisfies BaseAssetTransferTransaction
}

export const asAssetTransferTransaction = (
  transactionResult: TransactionResult,
  assetResolver: (assetId: bigint) => AsyncMaybeAtom<AssetSummary>
): AssetTransferTransaction => {
  return {
    id: transactionResult.id,
    ...mapCommonAssetTransferTransactionProperties(transactionResult, assetResolver),
  }
}

export const asInnerAssetTransferTransaction = (
  networkTransactionId: string,
  index: string,
  transactionResult: TransactionResult,
  assetResolver: (assetId: AssetId) => AsyncMaybeAtom<AssetSummary>
): InnerAssetTransferTransaction => {
  return {
    ...asInnerTransactionId(networkTransactionId, index),
    ...mapCommonAssetTransferTransactionProperties(transactionResult, assetResolver),
  }
}
