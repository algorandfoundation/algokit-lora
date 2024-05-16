import { ApplicationId } from './types'
import { indexer } from '@/features/common/data'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { useMemo } from 'react'
import { JotaiStore } from '@/features/common/data/types'
import { createTransactionsAtom, transactionResultsAtom } from '@/features/transactions/data'
import { atomEffect } from 'jotai-effect'
import { atom, useStore } from 'jotai'
import { modelsv2 } from 'algosdk'

const fetchApplicationBoxes = async (applicationId: ApplicationId, pageSize: number, nextPageToken?: string) => {
  const results = (await indexer
    .searchForApplicationBoxes(applicationId)
    .nextToken(nextPageToken ?? '')
    .limit(pageSize)
    .do()) as modelsv2.BoxesResponse
  return {
    transactionResults: results.boxes,
    nextPageToken: results['next-token'],
  } as const
}

const createSyncEffect = (transactionResults: TransactionResult[]) => {
  return atomEffect((_, set) => {
    ;(async () => {
      try {
        set(transactionResultsAtom, (prev) => {
          const next = new Map(prev)
          transactionResults.forEach((transactionResult) => {
            if (!next.has(transactionResult.id)) {
              next.set(transactionResult.id, atom(transactionResult))
            }
          })
          return next
        })
      } catch (e) {
        // Ignore any errors as there is nothing to sync
      }
    })()
  })
}

const createAssetTransactionsAtom = (store: JotaiStore, assetId: AssetId, pageSize: number, nextPageToken?: string) => {
  return atom(async (get) => {
    const { transactionResults, nextPageToken: newNextPageToken } = await fetchApplicationBoxes(assetId, pageSize, nextPageToken)

    get(createSyncEffect(transactionResults))

    const transactions = await get(createTransactionsAtom(store, transactionResults))

    return {
      rows: transactions,
      nextPageToken: newNextPageToken,
    }
  })
}

export const useFetchNextAssetTransactionsPage = (assetId: AssetId) => {
  const store = useStore()

  return useMemo(() => {
    return (pageSize: number, nextPageToken?: string) => createAssetTransactionsAtom(store, assetId, pageSize, nextPageToken)
  }, [store, assetId])
}
