import { BlockInnerTransaction } from '@algorandfoundation/algokit-subscriber/types/block'
import algosdk from 'algosdk'
import { Transaction } from '../models'
import { SendTransactionResults } from '@algorandfoundation/algokit-utils/types/transaction'
import { getIndexerTransactionFromAlgodTransaction } from '@algorandfoundation/algokit-subscriber/transform'
import { invariant } from '@/utils/invariant'
import { asTransaction } from '../mappers'
import { getAssetResultAtom } from '@/features/assets/data'
import { abiMethodResolver } from '@/features/abi-methods/data'
import { atom } from 'jotai'
import { GroupId, GroupResult } from '@/features/groups/data/types'
import { Round } from '@/features/blocks/data/types'
import { AssetId, AssetResult } from '@/features/assets/data/types'
import { asAssetSummary } from '@/features/assets/mappers'

const asBlockTransaction = (res: algosdk.modelsv2.PendingTransactionResponse): BlockInnerTransaction => {
  return {
    txn: res.txn.txn,
    sgnr: res.txn.sgnr,
    caid: res.txn.txn.caid,
    apid: res.txn.txn.apid,
    aca: res.assetClosingAmount,
    ca: res.closingAmount !== undefined ? Number(res.closingAmount) : undefined,
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

  const now = new Date()
  const groupResolver = (groupId: GroupId, round: Round) =>
    atom(() => {
      return Promise.resolve({
        id: groupId,
        timestamp: now.toISOString(),
        round,
        transactionIds: result.transactions.map((txn) => txn.txID()),
      } satisfies GroupResult)
    })

  // This mapping does some approximations, which are fine for the contexts we currently use it for.
  return result.confirmations.map((confirmation, i) => {
    const txnResult = getIndexerTransactionFromAlgodTransaction({
      blockTransaction: asBlockTransaction(confirmation),
      roundOffset: 0,
      roundIndex: 0,
      genesisHash: confirmation.txn.txn.gh,
      genesisId: confirmation.txn.txn.gen,
      roundNumber: Number(confirmation.confirmedRound ?? 0),
      roundTimestamp: Math.floor(now.getTime() / 1000),
      transaction: result.transactions[i],
      logs: confirmation.logs,
      createdAssetId: confirmation.assetIndex !== undefined ? Number(confirmation.assetIndex) : undefined,
      createdAppId: confirmation.applicationIndex !== undefined ? Number(confirmation.applicationIndex) : undefined,
      closeAmount: confirmation.closingAmount != undefined ? Number(confirmation.closingAmount) : undefined,
      assetCloseAmount: confirmation.assetClosingAmount,
    })

    const transaction = asTransaction(txnResult, assetSummaryResolver, abiMethodResolver, groupResolver)
    return transaction
  })
}

const assetSummaryResolver = (assetId: AssetId) =>
  atom(async (get) => {
    const assetResult = await get(getAssetResultAtom(assetId, { skipTimestampUpdate: true })).catch(() => {
      // It should never fail in the context we are current using this, however if it does, we return a slim asset. The may need to be expanded in the future.
      return {
        index: assetId,
        params: {
          creator: '',
          decimals: 0,
          total: 0,
        },
      } satisfies AssetResult
    })
    return asAssetSummary(assetResult)
  })
