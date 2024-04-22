import { AssetResult, TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import {
  AssetTransferTransactionModel,
  AssetTransferTransactionSubType,
  BaseAssetTransferTransactionModel,
  InnerAssetTransferTransactionModel,
  TransactionType,
} from '../models'
import { invariant } from '@/utils/invariant'
import { asAsset } from '@/features/assets/mappers/asset-mappers'
import { ZERO_ADDRESS } from '@/features/common/constants'
import { asInnerTransactionId, mapCommonTransactionProperties } from './transaction-common-properties-mappers'

const mapCommonAssetTransferTransactionProperties = (transaction: TransactionResult, asset: AssetResult) => {
  invariant(transaction['asset-transfer-transaction'], 'asset-transfer-transaction is not set')

  const subType = () => {
    invariant(transaction['asset-transfer-transaction'], 'asset-transfer-transaction is not set')

    if (transaction['asset-transfer-transaction']['close-to']) {
      return AssetTransferTransactionSubType.OptOut
    }
    if (
      transaction.sender === transaction['asset-transfer-transaction'].receiver &&
      transaction['asset-transfer-transaction'].amount === 0
    ) {
      return AssetTransferTransactionSubType.OptIn
    }
    if (
      transaction.sender === asset.params.clawback &&
      transaction['asset-transfer-transaction'].sender &&
      transaction['asset-transfer-transaction'].sender !== ZERO_ADDRESS
    ) {
      return AssetTransferTransactionSubType.Clawback
    }

    undefined
  }

  return {
    ...mapCommonTransactionProperties(transaction),
    type: TransactionType.AssetTransfer,
    subType: subType(),
    asset: asAsset(asset),
    receiver: transaction['asset-transfer-transaction'].receiver,
    amount: transaction['asset-transfer-transaction'].amount,
    closeRemainder: transaction['asset-transfer-transaction']['close-to']
      ? {
          to: transaction['asset-transfer-transaction']['close-to'],
          amount: transaction['asset-transfer-transaction']['close-amount'] ?? 0,
        }
      : undefined,
    clawbackFrom: transaction['asset-transfer-transaction'].sender,
  } satisfies BaseAssetTransferTransactionModel
}

export const asAssetTransferTransaction = (transaction: TransactionResult, asset: AssetResult): AssetTransferTransactionModel => {
  return {
    id: transaction.id,
    ...mapCommonAssetTransferTransactionProperties(transaction, asset),
  }
}

export const asInnerAssetTransferTransactionModel = (
  networkTransactionId: string,
  index: string,
  transaction: TransactionResult,
  asset: AssetResult
): InnerAssetTransferTransactionModel => {
  return {
    ...asInnerTransactionId(networkTransactionId, index),
    ...mapCommonAssetTransferTransactionProperties(transaction, asset),
  }
}
