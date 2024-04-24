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
import { Asset } from '@/features/assets/models'

const mapCommonAssetTransferTransactionProperties = (transactionResult: TransactionResult, asset: Asset) => {
  invariant(transactionResult['asset-transfer-transaction'], 'asset-transfer-transaction is not set')

  const subType = () => {
    invariant(transactionResult['asset-transfer-transaction'], 'asset-transfer-transaction is not set')

    if (transactionResult['asset-transfer-transaction']['close-to']) {
      return AssetTransferTransactionSubType.OptOut
    }
    if (
      transactionResult.sender === transactionResult['asset-transfer-transaction'].receiver &&
      transactionResult['asset-transfer-transaction'].amount === 0
    ) {
      return AssetTransferTransactionSubType.OptIn
    }
    if (
      transactionResult.sender === asset.clawback &&
      transactionResult['asset-transfer-transaction'].sender &&
      transactionResult['asset-transfer-transaction'].sender !== ZERO_ADDRESS
    ) {
      return AssetTransferTransactionSubType.Clawback
    }

    undefined
  }

  return {
    ...mapCommonTransactionProperties(transactionResult),
    type: TransactionType.AssetTransfer,
    subType: subType(),
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

export const asAssetTransferTransaction = (transactionResult: TransactionResult, asset: Asset): AssetTransferTransaction => {
  return {
    id: transactionResult.id,
    ...mapCommonAssetTransferTransactionProperties(transactionResult, asset),
  }
}

export const asInnerAssetTransferTransaction = (
  networkTransactionId: string,
  index: string,
  transactionResult: TransactionResult,
  asset: Asset
): InnerAssetTransferTransaction => {
  return {
    ...asInnerTransactionId(networkTransactionId, index),
    ...mapCommonAssetTransferTransactionProperties(transactionResult, asset),
  }
}
