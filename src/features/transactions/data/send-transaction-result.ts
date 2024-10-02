import { BlockInnerTransaction } from '@algorandfoundation/algokit-subscriber/types/block'
import algosdk from 'algosdk'
import { Transaction } from '../models'
import { SendTransactionResults } from '@algorandfoundation/algokit-utils/types/transaction'
import { getIndexerTransactionFromAlgodTransaction } from '@algorandfoundation/algokit-subscriber/transform'
import { invariant } from '@/utils/invariant'
import { asTransaction } from '../mappers'
import { assetSummaryResolver } from '@/features/assets/data'
import { abiMethodResolver } from '@/features/abi-methods/data'

const asBlockTransaction = (res: algosdk.modelsv2.PendingTransactionResponse): BlockInnerTransaction => {
  return {
    txn: res.txn.txn,
    dt: {
      // We don't use gd or ld in this context, so don't need to map.
      gd: {},
      ld: {},
      lg: res.logs ?? [],
      itx: res.innerTxns?.map((inner) => asBlockTransaction(inner)),
    },
  }
}

export const asTransactionFromSendResult = (result: SendTransactionResults): Transaction[] => {
  if (!result.confirmations || result.confirmations.length === 0 || result.transactions.length === 0) {
    return []
  }
  invariant(result.transactions.length === result.confirmations.length, 'All transactions must be confirmed')

  // This mapping does some approximations, which are fine for the contexts we currently use it for.
  return result.confirmations.map((confirmation, i) => {
    const txnResult = getIndexerTransactionFromAlgodTransaction({
      blockTransaction: asBlockTransaction(confirmation),
      roundOffset: 0,
      roundIndex: 0,
      genesisHash: confirmation.txn.txn.gh,
      genesisId: confirmation.txn.txn.gen,
      roundNumber: Number(confirmation.confirmedRound),
      roundTimestamp: Math.floor(Date.now() / 1000),
      transaction: result.transactions[i],
      logs: confirmation.logs,
      createdAssetId: confirmation.assetIndex !== undefined ? Number(confirmation.assetIndex) : undefined,
      createdAppId: confirmation.applicationIndex !== undefined ? Number(confirmation.applicationIndex) : undefined,
    })
    const transaction = asTransaction(txnResult, assetSummaryResolver, abiMethodResolver)
    return transaction
  })
}
