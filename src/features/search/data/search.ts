import { atom, useAtomValue, useSetAtom, useStore } from 'jotai'
import { loadable } from 'jotai/utils'
import { useMemo } from 'react'
import { JotaiStore } from '@/features/common/data/types'
import { Urls } from '@/routes/urls'
import { is404 } from '@/utils/error'
import { createAssetSummaryAtom } from '@/features/assets/data'
import { SearchResult, SearchResultType } from '../models'
import { ellipseAddress } from '@/utils/ellipse-address'
import { ellipseId } from '@/utils/ellipse-id'
import { handleErrorInAsyncMaybeAtom } from '@/utils/jotai'
import { atomWithDebounce } from '@/features/common/data'
import { isAddress } from '@/utils/is-address'
import { isTransactionId } from '@/utils/is-transaction-id'
import { isInteger } from '@/utils/is-integer'
import { syncedRoundAtom } from '@/features/blocks/data'
import { createApplicationSummaryAtom } from '@/features/applications/data/application-summary'
import { useSelectedNetwork } from '@/features/network/data'
import { getTransactionResultAtom } from '@/features/transactions/data'
import { getNfdResultAtom, isNFD } from '@/features/nfd/data'

const handle404 = (e: Error) => {
  if (is404(e)) {
    return undefined
  }
  throw e
}

const createSearchAtoms = (store: JotaiStore, selectedNetwork: string) => {
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
      const nfdAtom = getNfdResultAtom({ address: term, resolveNow: true })
      const nfd = await get(nfdAtom)
      results.push({
        type: SearchResultType.Account,
        id: term,
        label: `${ellipseAddress(term)}${nfd ? ` (${nfd.name})` : ''}`,
        url: Urls.Explore.Account.ByAddress.build({ address: term, networkId: selectedNetwork }),
      })
    } else if (isNFD(term)) {
      const nfdAtom = getNfdResultAtom({ nfd: term })
      const nfd = await get(nfdAtom)
      if (nfd && isAddress(nfd.depositAccount)) {
        results.push({
          type: SearchResultType.Account,
          id: nfd.depositAccount,
          label: `${ellipseAddress(nfd.depositAccount)} (${nfd.name})`,
          url: Urls.Explore.Account.ByAddress.build({ address: nfd.depositAccount, networkId: selectedNetwork }),
        })
      }
    } else if (isTransactionId(term)) {
      const transactionAtom = getTransactionResultAtom(term)
      const transaction = await handleErrorInAsyncMaybeAtom(get(transactionAtom), handle404)
      if (transaction) {
        results.push({
          type: SearchResultType.Transaction,
          id: term,
          label: ellipseId(term),
          url: Urls.Explore.Transaction.ById.build({ transactionId: term, networkId: selectedNetwork }),
        })
      }
    } else if (isInteger(term)) {
      const id = parseInt(term, 10)
      if (id >= 0) {
        const syncedRound = store.get(syncedRoundAtom)
        if (!syncedRound || syncedRound >= id) {
          results.push({
            type: SearchResultType.Block,
            id: id,
            label: id.toString(),
            url: Urls.Explore.Block.ByRound.build({ round: id.toString(), networkId: selectedNetwork }),
          })
        }

        const assetAtom = createAssetSummaryAtom(id)
        const applicationAtom = createApplicationSummaryAtom(id)

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
              url: Urls.Explore.Asset.ById.build({ assetId: id.toString(), networkId: selectedNetwork }),
            })
          }

          if (application) {
            results.push({
              type: SearchResultType.Application,
              id: id,
              label: id.toString(),
              url: Urls.Explore.Application.ById.build({ applicationId: id.toString(), networkId: selectedNetwork }),
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
  const [selectedNetwork] = useSelectedNetwork()
  return useMemo(() => {
    return createSearchAtoms(store, selectedNetwork)
  }, [selectedNetwork, store])
}

export const useSearch = () => {
  const [searchTermCurrentValueAtom, searchTermAtom, searchResultsAtom] = useSearchAtoms()
  return [useAtomValue(searchTermCurrentValueAtom), useSetAtom(searchTermAtom), useAtomValue(loadable(searchResultsAtom))] as const
}
