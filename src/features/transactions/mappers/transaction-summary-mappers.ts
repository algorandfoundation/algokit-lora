import { TransactionResult } from '@/features/transactions/data/types'
import { TransactionSummary, TransactionType } from '../models'
import { invariant } from '@/utils/invariant'
import algosdk from 'algosdk'
import { microAlgos } from '@algorandfoundation/algokit-utils'

export const asTransactionSummary = (transactionResult: TransactionResult): TransactionSummary => {
  const common = {
    id: transactionResult.id!,
    from: transactionResult.sender,
    fee: microAlgos(transactionResult.fee),
  }

  switch (transactionResult.txType) {
    case algosdk.TransactionType.pay:
      invariant(transactionResult.paymentTransaction, 'payment-transaction is not set')
      return {
        ...common,
        type: TransactionType.Payment,
        to: transactionResult.paymentTransaction.receiver,
      }
    case algosdk.TransactionType.axfer: {
      invariant(transactionResult.assetTransferTransaction, 'asset-transfer-transaction is not set')
      return {
        ...common,
        type: TransactionType.AssetTransfer,
        to: transactionResult.assetTransferTransaction.receiver,
      }
    }
    case algosdk.TransactionType.appl: {
      invariant(transactionResult.applicationTransaction, 'application-transaction is not set')

      return {
        ...common,
        type: TransactionType.AppCall,
        to: transactionResult.applicationTransaction.applicationId
          ? transactionResult.applicationTransaction.applicationId
          : transactionResult.createdApplicationIndex!,
        innerTransactions: transactionResult.innerTxns?.map((t) => asTransactionSummary(t)),
      }
    }
    case algosdk.TransactionType.acfg: {
      invariant(transactionResult.assetConfigTransaction, 'asset-config-transaction is not set')
      return {
        ...common,
        type: TransactionType.AssetConfig,
        to: transactionResult.assetConfigTransaction.assetId ?? transactionResult.createdAssetIndex,
      }
    }
    case algosdk.TransactionType.afrz: {
      invariant(transactionResult.assetFreezeTransaction, 'asset-freeze-transaction is not set')
      return {
        ...common,
        type: TransactionType.AssetFreeze,
        to: transactionResult.assetFreezeTransaction.assetId,
      }
    }
    case algosdk.TransactionType.stpf: {
      invariant(transactionResult.stateProofTransaction, 'state-proof-transaction is not set')
      return {
        ...common,
        type: TransactionType.StateProof,
      }
    }
    case algosdk.TransactionType.keyreg: {
      invariant(transactionResult.keyregTransaction, 'keyreg-transaction is not set')
      return {
        ...common,
        type: TransactionType.KeyReg,
      }
    }
    case algosdk.TransactionType.hb: {
      invariant(transactionResult['heartbeat-transaction'], 'heartbeat-transaction is not set')
      return {
        ...common,
        type: TransactionType.Heartbeat,
      }
    }
    default:
      throw new Error(`Unknown Transaction type ${transactionResult.txType}`)
  }
}
