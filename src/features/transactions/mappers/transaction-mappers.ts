import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { TransactionSummary, TransactionType } from '../models'
import { invariant } from '@/utils/invariant'
import { ZERO_ADDRESS } from '@/features/common/constants'
import algosdk from 'algosdk'
import { asAppCallTransaction } from './app-call-transaction-mappers'
import { asAssetTransferTransaction } from './asset-transfer-transaction-mappers'
import { asPaymentTransaction } from './payment-transaction-mappers'
import { asPlaceholderTransaction } from './placeholder-transaction-mappers'
import { Asset } from '@/features/assets/models'
import { asAssetConfigTransaction } from './asset-config-transaction-mappers'

export const asTransactionModel = async (
  transactionResult: TransactionResult,
  assetResolver: (assetId: number) => Promise<Asset> | Asset
) => {
  switch (transactionResult['tx-type']) {
    case algosdk.TransactionType.pay:
      return asPaymentTransaction(transactionResult)
    case algosdk.TransactionType.axfer: {
      invariant(transactionResult['asset-transfer-transaction'], 'asset-transfer-transaction is not set')
      const assetId = transactionResult['asset-transfer-transaction']['asset-id']
      const asset = await assetResolver(assetId)
      return asAssetTransferTransaction(transactionResult, asset)
    }
    case algosdk.TransactionType.appl: {
      invariant(transactionResult['application-transaction'], 'application-transaction is not set')
      const assetIds = transactionResult['application-transaction']['foreign-assets'] ?? []
      const uniqueAssetIds = Array.from(new Set(assetIds))
      const assets = await Promise.all(uniqueAssetIds.map((assetId) => assetResolver(assetId)))
      return asAppCallTransaction(transactionResult, assets)
    }
    case algosdk.TransactionType.acfg: {
      invariant(transactionResult['asset-config-transaction'], 'asset-config-transaction is not set')
      return asAssetConfigTransaction(transactionResult)
    }
    default:
      // TODO: Once we support all transaction types, we should throw an error instead
      // throw new Error(`${transaction['tx-type']} is not supported`)
      return asPlaceholderTransaction(transactionResult)
  }
}

export const asTransactionSummary = (transactionResult: TransactionResult): TransactionSummary => {
  const common = {
    id: transactionResult.id,
    from: transactionResult.sender,
  }

  switch (transactionResult['tx-type']) {
    case algosdk.TransactionType.pay:
      invariant(transactionResult['payment-transaction'], 'payment-transaction is not set')
      return {
        ...common,
        type: TransactionType.Payment,
        to: transactionResult['payment-transaction']['receiver'],
      }
    case algosdk.TransactionType.axfer: {
      invariant(transactionResult['asset-transfer-transaction'], 'asset-transfer-transaction is not set')
      return {
        ...common,
        type: TransactionType.AssetTransfer,
        to: transactionResult['asset-transfer-transaction']['receiver'],
      }
    }
    case algosdk.TransactionType.appl: {
      invariant(transactionResult['application-transaction'], 'application-transaction is not set')
      return {
        ...common,
        type: TransactionType.ApplicationCall,
        to: transactionResult['application-transaction']['application-id'],
      }
    }
    case algosdk.TransactionType.acfg: {
      invariant(transactionResult['asset-config-transaction'], 'asset-config-transaction is not set')
      return {
        ...common,
        type: TransactionType.AssetConfig,
        to: 'TODO: PD',
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
