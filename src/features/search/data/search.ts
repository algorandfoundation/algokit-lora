import { syncedRoundAtom } from '@/features/blocks/data/core'
import { atom, useAtomValue, useSetAtom, useStore } from 'jotai'
import { loadable } from 'jotai/utils'
import { useMemo } from 'react'
import { JotaiStore } from '@/features/common/data/types'
import { Urls } from '@/routes/urls'
import { is404 } from '@/utils/error'
import { getApplicationAtomBuilder } from '@/features/applications/data'
import { getAssetSummaryAtomBuilder } from '@/features/assets/data'
import { SearchResult, SearchResultType } from '../models'
import { ellipseAddress } from '@/utils/ellipse-address'
import { ellipseId } from '@/utils/ellipse-id'
import { handleErrorInAsyncMaybeAtom } from '@/utils/jotai'
import { atomWithDebounce } from '@/features/common/data'
import { isAddress } from '@/utils/is-address'
import { isTransactionId } from '@/utils/is-transaction-id'
import { isInteger } from '@/utils/is-integer'

const handle404 = (e: Error) => {
  if (is404(e)) {
    return undefined
  }
  throw e
}

const getSearchAtomsBuilder = (store: JotaiStore) => {
  const [currentTermAtom, termAtom, isDebouncingAtom] = atomWithDebounce<string>('')
  const searchResultsAtom = atom(async (get) => {
    // Return an async forever value if we are debouncing, so we can render a loader
    if (get(isDebouncingAtom)) {
      return new Promise<SearchResult[]>(() => [])
    }

    const term = store.get(termAtom)
    if (!term) {
      return []
    }

    const results: SearchResult[] = []

    if (isAddress(term)) {
      results.push({
        type: SearchResultType.Account,
        id: term,
        label: ellipseAddress(term),
        url: Urls.Explore.Account.ById.build({ address: term }),
      })
    } else if (isTransactionId(term)) {
      results.push({
        type: SearchResultType.Transaction,
        id: term,
        label: ellipseId(term),
        url: Urls.Explore.Transaction.ById.build({ transactionId: term }),
      })
    } else if (isInteger(term)) {
      const id = parseInt(term, 10)
      if (id >= 0) {
        const syncedRound = store.get(syncedRoundAtom)
        if (!syncedRound || syncedRound >= id) {
          results.push({
            type: SearchResultType.Block,
            id: id,
            label: id.toString(),
            url: Urls.Explore.Block.ById.build({ round: id.toString() }),
          })
        }

        const assetAtom = getAssetSummaryAtomBuilder(store, id)
        const applicationAtom = getApplicationAtomBuilder(store, id)

        try {
          const [asset, application] = await Promise.all([
            handleErrorInAsyncMaybeAtom(get(assetAtom), handle404),
            handleErrorInAsyncMaybeAtom(get(applicationAtom), handle404),
          ])

          if (asset) {
            results.push({
              type: SearchResultType.Asset,
              id: id,
              label: asset.name ? `${id} (${asset.name})` : id.toString(),
              url: Urls.Explore.Asset.ById.build({ assetId: id.toString() }),
            })
          }

          if (application) {
            results.push({
              type: SearchResultType.Application,
              id: id,
              label: id.toString(),
              url: Urls.Explore.Application.ById.build({ applicationId: id.toString() }),
            })
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Failed to fetch data for search results', e)
        }
      }
    }

    return results
  })

  return [currentTermAtom, termAtom, searchResultsAtom] as const
}

const useSearchAtoms = () => {
  const store = useStore()
  return useMemo(() => {
    return getSearchAtomsBuilder(store)
  }, [store])
}

export const useSearch = () => {
  const [searchTermCurrentValueAtom, searchTermAtom, searchResultsAtom] = useSearchAtoms()
  return [useAtomValue(searchTermCurrentValueAtom), useSetAtom(searchTermAtom), useAtomValue(loadable(searchResultsAtom))] as const
}
