import { Atom, atom, useAtomValue, useStore } from 'jotai'
import { useMemo } from 'react'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { atomEffect } from 'jotai-effect'
import { loadable } from 'jotai/utils'
import { lookupTransactionById } from '@algorandfoundation/algokit-utils'
import { invariant } from '@/utils/invariant'
import { TransactionType as AlgoSdkTransactionType } from 'algosdk'
import { TransactionId } from './types'
import { indexer } from '@/features/common/data'
import { JotaiStore } from '@/features/common/data/types'
import { asTransaction } from '../mappers/transaction-mappers'
import { getAssetAtomBuilder, getAssetsAtomBuilder } from '@/features/assets/data'
import { getAssetIdsForTransaction } from '../utils/get-asset-ids-for-app-call-transaction'
import { transactionResultsAtom } from './core'

export const fetchTransactionResultAtomBuilder = (store: JotaiStore, transactionId: TransactionId) => {
  const syncEffect = atomEffect((get, set) => {
    ;(async () => {
      try {
        const transaction = await get(transactionResultAtom)
        set(transactionResultsAtom, (prev) => {
          return new Map([...prev, [transaction.id, transaction]])
        })
      } catch (e) {
        // Ignore any errors as there is nothing to sync
      }
    })()
  })
  const transactionResultAtom = atom((get) => {
    const transactionResults = store.get(transactionResultsAtom)
    const cachedTransactionResult = transactionResults.get(transactionId)
    if (cachedTransactionResult) {
      return cachedTransactionResult
    }

    get(syncEffect)

    return lookupTransactionById(transactionId, indexer).then((result) => {
      return result.transaction
    })
  })
  return transactionResultAtom
}

export const fetchTransactionResultsAtomBuilder = (store: JotaiStore, transactionIds: TransactionId[]) => {
  return atom((get) => {
    return Promise.all(transactionIds.map((transactionId) => get(fetchTransactionResultAtomBuilder(store, transactionId))))
  })
}

export const fetchTransactionsAtomBuilder = (
  store: JotaiStore,
  transactionResults: TransactionResult[] | Atom<TransactionResult[] | Promise<TransactionResult[]>>
) => {
  return atom(async (get) => {
    const txns = Array.isArray(transactionResults) ? transactionResults : await get(transactionResults)
    const assetIds = Array.from(
      txns.reduce((acc, txn) => {
        if (txn['tx-type'] === AlgoSdkTransactionType.axfer && txn['asset-transfer-transaction']) {
          const assetId = txn['asset-transfer-transaction']['asset-id']
          if (!acc.has(assetId)) {
            acc.add(assetId)
          }
        }
        if (txn['tx-type'] === AlgoSdkTransactionType.appl && txn['application-transaction']) {
          const assetIds = getAssetIdsForTransaction(txn)
          assetIds.forEach((assetId) => {
            if (!acc.has(assetId)) {
              acc.add(assetId)
            }
          })
        }
        return acc
      }, new Set<number>())
    )

    const assets = new Map(
      (await get(getAssetsAtomBuilder(store, assetIds))).map((a) => {
        return [a.id, a] as const
      })
    )

    return await Promise.all(
      txns.map((transactionResult) => {
        return asTransaction(transactionResult, (assetId: number) => {
          const asset = assets.get(assetId)
          invariant(asset, `when mapping ${transactionResult.id}, asset with id ${assetId} could not be retrieved`)
          return asset
        })
      })
    )
  })
}

export const fetchTransactionAtomBuilder = (
  store: JotaiStore,
  transactionResult: TransactionResult | Atom<TransactionResult | Promise<TransactionResult>>
) => {
  return atom(async (get) => {
    const txn = 'id' in transactionResult ? transactionResult : await get(transactionResult)
    return await asTransaction(txn, (assetId: number) => get(getAssetAtomBuilder(store, assetId)))
  })
}

const useTransactionAtom = (transactionId: TransactionId) => {
  const store = useStore()

  return useMemo(() => {
    return fetchTransactionAtomBuilder(store, fetchTransactionResultAtomBuilder(store, transactionId))
  }, [store, transactionId])
}

export const useLoadableTransactionAtom = (transactionId: TransactionId) => {
  return useAtomValue(loadable(useTransactionAtom(transactionId)))
}
