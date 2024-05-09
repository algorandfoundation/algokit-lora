import { Atom, atom, useAtomValue, useStore } from 'jotai'
import { atomEffect } from 'jotai-effect'
import { loadable } from 'jotai/utils'
import { JotaiStore } from './types'
import { useMemo } from 'react'

export type RawDataPage<TData> = {
  rows: TData[]
  nextPageToken?: string
}

export type ViewModelPage<TViewModel> = {
  rows: TViewModel[]
  nextPageToken?: string
}

type LoadablePaginationBuilderInput<TData, TViewModel> = {
  fetchNextPage: (nextPageToken?: string) => Promise<RawDataPage<TData>>
  mapper: (store: JotaiStore, rows: TData[]) => Atom<Promise<TViewModel[]>>
}

export function loadablePaginationBuilder<TData, TViewModel>({ fetchNextPage, mapper }: LoadablePaginationBuilderInput<TData, TViewModel>) {
  // TODO: need to reset this atom when page size changed
  const rawDataPagesAtom = atom<RawDataPage<TData>[]>([])

  const syncEffectBuilder = ({ rows, nextPageToken }: { rows: TData[]; nextPageToken?: string }) => {
    return atomEffect((_, set) => {
      ;(async () => {
        try {
          set(rawDataPagesAtom, (prev) => {
            return Array.from(prev).concat([{ rows, nextPageToken }])
          })
        } catch (e) {
          // Ignore any errors as there is nothing to sync
        }
      })()
    })
  }

  const getViewModelPageAtomBuilder = (store: JotaiStore, pageNumber: number) => {
    return atom(async (get) => {
      const index = pageNumber - 1
      const cache = store.get(rawDataPagesAtom)

      if (index < cache.length) {
        const page = cache[index]
        return {
          rows: await get(mapper(store, page.rows)),
          nextPageToken: page.nextPageToken,
        } satisfies ViewModelPage<TViewModel>
      }

      const currentNextPageToken = cache[cache.length - 1]?.nextPageToken
      const { rows, nextPageToken } = await fetchNextPage(currentNextPageToken)

      get(syncEffectBuilder({ rows, nextPageToken }))

      return {
        rows: await get(mapper(store, rows)),
        nextPageToken,
      } satisfies ViewModelPage<TViewModel>
    })
  }

  const useViewModelPageAtom = (pageNumber: number) => {
    const store = useStore()

    return useMemo(() => {
      return getViewModelPageAtomBuilder(store, pageNumber)
    }, [store, pageNumber])
  }

  const useLoadablePage = (pageNumber: number) => {
    return useAtomValue(loadable(useViewModelPageAtom(pageNumber)))
  }

  return { useLoadablePage } as const
}
