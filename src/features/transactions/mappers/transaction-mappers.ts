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
import { getAssetIdsForTransaction } from '../utils/get-asset-ids-for-transaction'
import { asAssetConfigTransaction } from './asset-config-transaction-mappers'
import { asAssetFreezeTransaction } from './asset-freeze-transaction-mappers'
import { asStateProofTransaction } from './state-proof-transaction-mappers'

export const asTransaction = async (transactionResult: TransactionResult, assetResolver: (assetId: number) => Promise<Asset> | Asset) => {
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
      const assetIds = Array.from(new Set(getAssetIdsForTransaction(transactionResult)))
      const assets = await Promise.all(assetIds.map((assetId) => assetResolver(assetId)))
      return asAppCallTransaction(transactionResult, assets)
    }
    case algosdk.TransactionType.acfg: {
      invariant(transactionResult['asset-config-transaction'], 'asset-config-transaction is not set')
      return asAssetConfigTransaction(transactionResult)
    }
    case algosdk.TransactionType.afrz: {
      invariant(transactionResult['asset-freeze-transaction'], 'asset-freeze-transaction is not set')
      const assetId = transactionResult['asset-freeze-transaction']['asset-id']
      const asset = await assetResolver(assetId)
      return asAssetFreezeTransaction(transactionResult, asset)
    }
    case algosdk.TransactionType.stpf: {
      invariant(transactionResult['state-proof-transaction'], 'state-proof-transaction is not set')
      return asStateProofTransaction(transactionResult)
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
        to: transactionResult['asset-config-transaction']['asset-id'] ?? transactionResult['created-asset-index'],
      }
    }
    case algosdk.TransactionType.afrz: {
      invariant(transactionResult['asset-freeze-transaction'], 'asset-freeze-transaction is not set')
      return {
        ...common,
        type: TransactionType.AssetFreeze,
        to: transactionResult['asset-freeze-transaction']['asset-id'],
      }
    }
    case algosdk.TransactionType.stpf: {
      invariant(transactionResult['state-proof-transaction'], 'state-proof-transaction is not set')
      return {
        ...common,
        type: TransactionType.StateProof,
        to: '',
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
