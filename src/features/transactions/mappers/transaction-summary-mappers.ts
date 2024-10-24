import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { TransactionSummary, TransactionType } from '../models'
import { invariant } from '@/utils/invariant'
import algosdk from 'algosdk'
import { microAlgos } from '@algorandfoundation/algokit-utils'

export const asTransactionSummary = (transactionResult: TransactionResult): TransactionSummary => {
  const common = {
    id: transactionResult.id,
    from: transactionResult.sender,
    fee: microAlgos(transactionResult.fee),
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
        type: TransactionType.AppCall,
        to: transactionResult['application-transaction']['application-id'],
        innerTransactions: transactionResult['inner-txns']?.map((t) => asTransactionSummary(t)),
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
      }
    }
    case algosdk.TransactionType.keyreg: {
      invariant(transactionResult['keyreg-transaction'], 'keyreg-transaction is not set')
      return {
        ...common,
        type: TransactionType.KeyReg,
      }
    }
    default:
      throw new Error(`Unknown Transaction type ${transactionResult['tx-type']}`)
  }
}
