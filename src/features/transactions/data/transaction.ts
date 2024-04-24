import { Atom, atom, useAtomValue, useSetAtom, useStore } from 'jotai'
import { useMemo } from 'react'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { atomEffect } from 'jotai-effect'
import { loadable } from 'jotai/utils'
import { lookupTransactionById } from '@algorandfoundation/algokit-utils'
import { invariant } from '@/utils/invariant'
import { TransactionType } from 'algosdk'
import { Buffer } from 'buffer'
import { TransactionId } from './types'
import { indexer, algod } from '@/features/common/data'
import { JotaiStore } from '@/features/common/data/types'
import { asTransactionModel } from '../mappers/transaction-mappers'
import { getAssetAtomBuilder, getAssetsAtomBuilder } from '@/features/assets/data'
import { InnerTransactionModel, TransactionModel, TransactionType as TransactionTypeModel } from '../models'
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

export const fetchTransactionsModelAtomBuilder = (
  store: JotaiStore,
  transactionResults: TransactionResult[] | Atom<TransactionResult[] | Promise<TransactionResult[]>>
) => {
  return atom(async (get) => {
    const txns = Array.isArray(transactionResults) ? transactionResults : await get(transactionResults)
    const assetIds = Array.from(
      txns.reduce((acc, txn) => {
        if (txn['tx-type'] === TransactionType.axfer && txn['asset-transfer-transaction']) {
          const assetId = txn['asset-transfer-transaction']['asset-id']
          if (!acc.has(assetId)) {
            acc.add(assetId)
          }
        }
        if (txn['tx-type'] === TransactionType.appl && txn['application-transaction']) {
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
        return asTransactionModel(transactionResult, (assetId: number) => {
          const asset = assets.get(assetId)
          invariant(asset, `when mapping ${transactionResult.id}, asset with id ${assetId} could not be retrieved`)
          return asset
        })
      })
    )
  })
}

export const fetchTransactionModelAtomBuilder = (
  store: JotaiStore,
  transactionResult: TransactionResult | Atom<TransactionResult | Promise<TransactionResult>>
) => {
  return atom(async (get) => {
    const txn = 'id' in transactionResult ? transactionResult : await get(transactionResult)
    return await asTransactionModel(txn, (assetId: number) => get(getAssetAtomBuilder(store, assetId)))
  })
}

export const fetchInnerTransactionModelAtomBuilder = (
  store: JotaiStore,
  transactionResult: TransactionResult | Atom<TransactionResult | Promise<TransactionResult>>,
  innerId: string
) => {
  return atom(async (get) => {
    const txn = 'id' in transactionResult ? transactionResult : await get(transactionResult)
    const transactionModel = await asTransactionModel(txn, (assetId: number) => get(getAssetAtomBuilder(store, assetId)))
    if (transactionModel.type !== TransactionTypeModel.ApplicationCall) {
      throw new Error('Only application call transactions have inner transactions')
    }

    const indexes = innerId.split('-').map((s) => parseInt(s))
    let current: TransactionModel | InnerTransactionModel = transactionModel
    for (const i of indexes) {
      if (current.type === TransactionTypeModel.ApplicationCall) {
        current = current.innerTransactions[i - 1]
      }
    }

    return current
  })
}

const useTransactionModelAtom = (transactionId: TransactionId) => {
  const store = useStore()

  return useMemo(() => {
    return fetchTransactionModelAtomBuilder(store, fetchTransactionResultAtomBuilder(store, transactionId))
  }, [store, transactionId])
}

const useInnerTransactionModelAtom = (transactionId: TransactionId, innerId: string) => {
  const store = useStore()

  return useMemo(() => {
    return fetchInnerTransactionModelAtomBuilder(store, fetchTransactionResultAtomBuilder(store, transactionId), innerId)
  }, [store, transactionId, innerId])
}

export const useLogicsigTeal = (logic: string) => {
  const [tealAtom, fetchTealAtom] = useMemo(() => {
    const tealAtom = atom<Promise<string> | undefined>(undefined)
    const fetchTealAtom = atom(null, (get, set) => {
      if (get(tealAtom)) {
        return
      }

      const program = new Uint8Array(Buffer.from(logic, 'base64'))
      set(
        tealAtom,
        algod
          .disassemble(program)
          .do()
          .then((result) => result.result as string)
      )
    })
    return [tealAtom, fetchTealAtom] as const
  }, [logic])

  return [useAtomValue(loadable(tealAtom)), useSetAtom(fetchTealAtom)] as const
}

export const useLoadableTransactionModelAtom = (transactionId: TransactionId) => {
  return useAtomValue(loadable(useTransactionModelAtom(transactionId)))
}

export const useLoadableInnerTransactionModelAtom = (transactionId: TransactionId, innerId: string) => {
  return useAtomValue(loadable(useInnerTransactionModelAtom(transactionId, innerId)))
}
