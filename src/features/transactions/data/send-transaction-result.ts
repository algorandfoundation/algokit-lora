import { Transaction } from '../models'
import { SendTransactionResults } from '@algorandfoundation/algokit-utils/types/transaction'
import { invariant } from '@/utils/invariant'
import { asTransaction } from '../mappers'
import { getAssetResultAtom } from '@/features/assets/data'
import { abiMethodResolver } from '@/features/abi-methods/data'
import { atom } from 'jotai'
import { GroupId, GroupResult } from '@/features/groups/data/types'
import { Round } from '@/features/blocks/data/types'
import { AssetId } from '@/features/assets/data/types'
import { asAssetSummary } from '@/features/assets/mappers'
import { getIndexerTransactionFromAlgodTransaction } from '@algorandfoundation/algokit-subscriber/transform'
import algosdk, { SignedTxnWithAD } from 'algosdk'
import { accumulateGroupsFromTransaction } from '@/features/blocks/data'
import { subscribedTransactionToTransactionResult } from '../mappers/subscriber-transaction-mappers'

const asSignedTxnWithAD = (res: algosdk.modelsv2.PendingTransactionResponse): SignedTxnWithAD => {
  return new SignedTxnWithAD({
    signedTxn: new algosdk.SignedTransaction({
      txn: res.txn.txn,
      sgnr: res.txn.sgnr,
    }),
    applyData: new algosdk.ApplyData({
      configAsset: res.assetIndex,
      applicationID: res.applicationIndex,
      closingAmount: res.closingAmount,
      assetClosingAmount: res.assetClosingAmount,
      evalDelta: new algosdk.EvalDelta({
        logs: res.logs,
        innerTxns: res.innerTxns?.map((inner) => asSignedTxnWithAD(inner)),
      }),
    }),
  })
}

export const asTransactionFromSendResult = (result: SendTransactionResults): Transaction[] => {
  if (!result.confirmations || result.confirmations.length === 0 || result.transactions.length === 0) {
    return []
  }
  invariant(result.transactions.length === result.confirmations.length, 'All transactions must be confirmed')

  const now = new Date()
  const groups = new Map<GroupId, GroupResult>()

  // This mapping does some approximations, which are fine for the contexts we currently use it for.
  const transactionResults = result.confirmations.map((confirmation, i) => {
    invariant(confirmation.txn.txn.genesisHash, 'Genesis hash is required')
    invariant(confirmation.txn.txn.genesisID, 'Genesis ID is required')

    const subscribedTransaction = getIndexerTransactionFromAlgodTransaction({
      signedTxnWithAD: asSignedTxnWithAD(confirmation),
      intraRoundOffset: 0,
      transactionId: confirmation.txn.txn.txID(),
      genesisHash: Buffer.from(confirmation.txn.txn.genesisHash),
      genesisId: confirmation.txn.txn.genesisID,
      roundNumber: confirmation.confirmedRound ?? 0n,
      roundTimestamp: Math.floor(now.getTime() / 1000),
      transaction: result.transactions[i],
      logs: confirmation.logs,
      createdAssetId: confirmation.assetIndex,
      createdAppId: confirmation.applicationIndex,
      closeAmount: confirmation.closingAmount,
      assetCloseAmount: confirmation.assetClosingAmount,
    })

    return subscribedTransactionToTransactionResult(subscribedTransaction)
  })

  transactionResults.forEach((txnResult) => {
    accumulateGroupsFromTransaction(groups, txnResult, 0n, 0)
  })

  const groupResolver = (groupId: GroupId, round: Round) =>
    atom(() => {
      return {
        id: groupId,
        timestamp: now.toISOString(),
        round,
        transactionIds: groups.get(groupId)?.transactionIds ?? [],
      } satisfies GroupResult
    })

  return transactionResults.map((txnResult) => asTransaction(txnResult, assetSummaryResolver, abiMethodResolver, groupResolver))
}

const assetSummaryResolver = (assetId: AssetId) =>
  atom(async (get) => {
    try {
      const assetResult = await get(getAssetResultAtom(assetId, { skipTimestampUpdate: true }))
      return asAssetSummary(assetResult)
    } catch {
      return asAssetSummary({
        index: assetId,
        params: {
          creator: '',
          decimals: 0,
          total: 0n,
        },
      })
    }
  })
