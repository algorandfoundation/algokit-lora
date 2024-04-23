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

// TODO: Size should be capped at some limit, so memory usage doesn't grow indefinitely
export const transactionsAtom = atom<Map<TransactionId, TransactionResult>>(new Map())

export const fetchTransactionAtomBuilder = (store: JotaiStore, transactionId: TransactionId) => {
  const syncEffect = atomEffect((get, set) => {
    ;(async () => {
      try {
        const transaction = await get(transactionAtom)
        set(transactionsAtom, (prev) => {
          return new Map([...prev, [transaction.id, transaction]])
        })
      } catch (e) {
        // Ignore any errors as there is nothing to sync
      }
    })()
  })
  const transactionAtom = atom((get) => {
    const transactions = store.get(transactionsAtom)
    const cachedTransaction = transactions.get(transactionId)
    if (cachedTransaction) {
      return cachedTransaction
    }

    get(syncEffect)

    return lookupTransactionById(transactionId, indexer).then((result) => {
      return result.transaction
    })
  })
  return transactionAtom
}

export const fetchTransactionsAtomBuilder = (store: JotaiStore, transactionIds: TransactionId[]) => {
  return atom((get) => {
    return Promise.all(transactionIds.map((transactionId) => get(fetchTransactionAtomBuilder(store, transactionId))))
  })
}

export const fetchTransactionsModelAtomBuilder = (
  store: JotaiStore,
  transactions: TransactionResult[] | Atom<TransactionResult[] | Promise<TransactionResult[]>>
) => {
  return atom(async (get) => {
    const txns = Array.isArray(transactions) ? transactions : await get(transactions)
    const assetIds = Array.from(
      txns.reduce((acc, txn) => {
        if (txn['tx-type'] === TransactionType.axfer && txn['asset-transfer-transaction']) {
          const assetId = txn['asset-transfer-transaction']['asset-id']
          if (!acc.has(assetId)) {
            acc.add(assetId)
          }
        }
        if (txn['tx-type'] === TransactionType.appl && txn['application-transaction']) {
          const assetIds = txn['application-transaction']['foreign-assets'] ?? []
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
      txns.map((transaction) => {
        return asTransactionModel(transaction, (assetId: number) => {
          const asset = assets.get(assetId)
          invariant(asset, `when mapping ${transaction.id}, asset with id ${assetId} could not be retrieved`)
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
    return fetchTransactionModelAtomBuilder(store, fetchTransactionAtomBuilder(store, transactionId))
  }, [store, transactionId])
}

const useInnerTransactionModelAtom = (transactionId: TransactionId, innerId: string) => {
  const store = useStore()

  return useMemo(() => {
    return fetchInnerTransactionModelAtomBuilder(store, fetchTransactionAtomBuilder(store, transactionId), innerId)
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
