import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
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
import { unwrap } from 'jotai/utils'
import { dataStore } from '@/features/common/data/data-store'

const mapSubType = (transactionResult: TransactionResult, assetAtom: AsyncMaybeAtom<AssetSummary>) => {
  invariant(transactionResult['asset-transfer-transaction'], 'asset-transfer-transaction is not set')
  const assetTransfer = transactionResult['asset-transfer-transaction']

  if (transactionResult.sender === assetTransfer.receiver && assetTransfer.amount === 0) {
    return AssetTransferTransactionSubType.OptIn
  }

  if (assetTransfer['close-to']) {
    return AssetTransferTransactionSubType.OptOut
  }

  const asset = dataStore.get(unwrap(assetAtom))
  console.log(asset)
  if (
    asset &&
    transactionResult.sender === asset.clawback &&
    assetTransfer.sender &&
    assetTransfer.sender !== ZERO_ADDRESS &&
    assetTransfer.receiver &&
    assetTransfer.receiver !== ZERO_ADDRESS
  ) {
    return AssetTransferTransactionSubType.Clawback
  }
}

const mapCommonAssetTransferTransactionProperties = (
  transactionResult: TransactionResult,
  assetResolver: (assetId: number) => AsyncMaybeAtom<AssetSummary>
) => {
  invariant(transactionResult['asset-transfer-transaction'], 'asset-transfer-transaction is not set')

  const assetId = transactionResult['asset-transfer-transaction']['asset-id']
  const asset = assetResolver(assetId)

  return {
    ...mapCommonTransactionProperties(transactionResult),
    type: TransactionType.AssetTransfer,
    subType: mapSubType(transactionResult, asset),
    assetId,
    asset,
    receiver: transactionResult['asset-transfer-transaction'].receiver,
    amount: transactionResult['asset-transfer-transaction'].amount,
    closeRemainder: transactionResult['asset-transfer-transaction']['close-to']
      ? {
          to: transactionResult['asset-transfer-transaction']['close-to'],
          amount: transactionResult['asset-transfer-transaction']['close-amount'] ?? 0,
        }
      : undefined,
    clawbackFrom: transactionResult['asset-transfer-transaction'].sender,
  } satisfies BaseAssetTransferTransaction
}

export const asAssetTransferTransaction = (
  transactionResult: TransactionResult,
  assetResolver: (assetId: number) => AsyncMaybeAtom<AssetSummary>
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
  assetResolver: (assetId: number) => AsyncMaybeAtom<AssetSummary>
): InnerAssetTransferTransaction => {
  return {
    ...asInnerTransactionId(networkTransactionId, index),
    ...mapCommonAssetTransferTransactionProperties(transactionResult, assetResolver),
  }
}
