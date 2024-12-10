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
import { TransactionResult } from './types'

export const asTransactionFromSendResult = (result: SendTransactionResults): Transaction[] => {
  if (!result.confirmations || result.confirmations.length === 0 || result.transactions.length === 0) {
    return []
  }
  invariant(result.transactions.length === result.confirmations.length, 'All transactions must be confirmed')

  const now = new Date()
  const groupResolver = (groupId: GroupId, round: Round) =>
    atom(() => {
      return {
        id: groupId,
        timestamp: now.toISOString(),
        round,
        transactionIds: result.transactions.map((txn) => txn.txID()),
      } satisfies GroupResult
    })

  // This mapping does some approximations, which are fine for the contexts we currently use it for.
  return result.confirmations.map((confirmation) => {
    invariant(confirmation.txn.txn.genesisHash, 'Genesis hash is required')
    invariant(confirmation.txn.txn.genesisID, 'Genesis ID is required')

    // TODO: PD - test
    const txnResult = {
      ...confirmation.txn.txn,
      sender: confirmation.txn.txn.sender.toString(),
    } satisfies TransactionResult

    const transaction = asTransaction(txnResult, assetSummaryResolver, abiMethodResolver, groupResolver)
    return transaction
  })
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
