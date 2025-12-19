import { TransactionResult } from '@/features/transactions/data/types'
import { TransactionSummary, TransactionType } from '../models'
import { invariant } from '@/utils/invariant'
import { TransactionType as UtilsTransactionType } from '@algorandfoundation/algokit-utils/transact'
import { microAlgos } from '@algorandfoundation/algokit-utils'

export const asTransactionSummary = (transactionResult: TransactionResult): TransactionSummary => {
  const common = {
    id: transactionResult.id,
    from: transactionResult.sender,
    fee: microAlgos(transactionResult.fee),
  }

  switch (transactionResult.txType) {
    case UtilsTransactionType.Payment:
      invariant(transactionResult.paymentTransaction, 'payment-transaction is not set')
      return {
        ...common,
        type: TransactionType.Payment,
        to: transactionResult.paymentTransaction.receiver,
      }
    case UtilsTransactionType.AssetTransfer: {
      invariant(transactionResult.assetTransferTransaction, 'asset-transfer-transaction is not set')
      return {
        ...common,
        type: TransactionType.AssetTransfer,
        to: transactionResult.assetTransferTransaction.receiver,
      }
    }
    case UtilsTransactionType.AppCall: {
      invariant(transactionResult.applicationTransaction, 'application-transaction is not set')

      return {
        ...common,
        type: TransactionType.AppCall,
        to: transactionResult.applicationTransaction.applicationId
          ? transactionResult.applicationTransaction.applicationId
          : transactionResult.createdAppId!,
      }
    }
    case UtilsTransactionType.AssetConfig: {
      invariant(transactionResult.assetConfigTransaction, 'asset-config-transaction is not set')
      return {
        ...common,
        type: TransactionType.AssetConfig,
        to: transactionResult.assetConfigTransaction.assetId
          ? transactionResult.assetConfigTransaction.assetId
          : transactionResult.createdAssetIndex,
      }
    }
    case UtilsTransactionType.AssetFreeze: {
      invariant(transactionResult.assetFreezeTransaction, 'asset-freeze-transaction is not set')
      return {
        ...common,
        type: TransactionType.AssetFreeze,
        to: transactionResult.assetFreezeTransaction.assetId,
      }
    }
    case UtilsTransactionType.StateProof: {
      invariant(transactionResult.stateProofTransaction, 'state-proof-transaction is not set')
      return {
        ...common,
        type: TransactionType.StateProof,
      }
    }
    case UtilsTransactionType.KeyRegistration: {
      invariant(transactionResult.keyregTransaction, 'keyreg-transaction is not set')
      return {
        ...common,
        type: TransactionType.KeyReg,
      }
    }
    case UtilsTransactionType.Heartbeat: {
      invariant(transactionResult.heartbeatTransaction, 'heartbeat-transaction is not set')
      return {
        ...common,
        type: TransactionType.Heartbeat,
      }
    }
    default:
      throw new Error(`Unknown Transaction type ${transactionResult.txType}`)
  }
}
