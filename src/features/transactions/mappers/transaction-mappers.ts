import { AssetResult, TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { TransactionSummary, TransactionType } from '../models'
import { invariant } from '@/utils/invariant'
import { ZERO_ADDRESS } from '@/features/common/constants'
import algosdk from 'algosdk'
import { asAppCallTransaction } from './app-call-transaction-mappers'
import { asAssetTransferTransaction } from './asset-transfer-transaction-mappers'
import { asPaymentTransaction } from './payment-transaction-mappers'
import { asPlaceholderTransaction } from './placeholder-transaction-mappers'

export const asTransactionModel = async (
  transaction: TransactionResult,
  assetResolver: (assetId: number) => Promise<AssetResult> | AssetResult
) => {
  switch (transaction['tx-type']) {
    case algosdk.TransactionType.pay:
      return asPaymentTransaction(transaction)
    case algosdk.TransactionType.axfer: {
      invariant(transaction['asset-transfer-transaction'], 'asset-transfer-transaction is not set')
      const assetId = transaction['asset-transfer-transaction']['asset-id']
      const asset = await assetResolver(assetId)
      return asAssetTransferTransaction(transaction, asset)
    }
    case algosdk.TransactionType.appl: {
      invariant(transaction['application-transaction'], 'application-transaction is not set')
      const assetIds = transaction['application-transaction']['foreign-assets'] ?? []
      const uniqueAssetIds = Array.from(new Set(assetIds))
      const assets = await Promise.all(uniqueAssetIds.map((assetId) => assetResolver(assetId)))
      return asAppCallTransaction(transaction, assets)
    }
    default:
      // TODO: Once we support all transaction types, we should throw an error instead
      // throw new Error(`${transaction['tx-type']} is not supported`)
      return asPlaceholderTransaction(transaction)
  }
}

export const asTransactionSummary = (transaction: TransactionResult): TransactionSummary => {
  const common = {
    id: transaction.id,
    from: transaction.sender,
  }

  switch (transaction['tx-type']) {
    case algosdk.TransactionType.pay:
      invariant(transaction['payment-transaction'], 'payment-transaction is not set')
      return {
        ...common,
        type: TransactionType.Payment,
        to: transaction['payment-transaction']['receiver'],
      }
    case algosdk.TransactionType.axfer: {
      invariant(transaction['asset-transfer-transaction'], 'asset-transfer-transaction is not set')
      return {
        ...common,
        type: TransactionType.AssetTransfer,
        to: transaction['asset-transfer-transaction']['receiver'],
      }
    }
    default:
      // TODO: Once we support all transaction types, we should throw an error instead
      // throw new Error(`${transaction['tx-type']} is not supported`)
      return {
        ...common,
        type: TransactionType.Payment,
        to: ZERO_ADDRESS,
      }
  }
}
