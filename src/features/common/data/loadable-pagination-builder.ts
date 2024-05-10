import { Atom, atom, useAtomValue, useStore } from 'jotai'
import { atomEffect } from 'jotai-effect'
import { loadable } from 'jotai/utils'
import { JotaiStore } from './types'
import { useMemo } from 'react'

export type DataPage<TData> = {
  rows: TData[]
  nextPageToken?: string
}

type LoadablePaginationBuilderInput<TData> = {
  pageSize: number
  fetchNextPage: (pageSize: number, nextPageToken?: string) => Atom<Promise<DataPage<TData>>>
}

export function loadablePaginationBuilder<TData>({ pageSize, fetchNextPage }: LoadablePaginationBuilderInput<TData>) {
  const rawDataPagesAtom = atom<DataPage<TData>[]>([])

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

  const getViewModelPageAtomBuilder = (store: JotaiStore, pageSize: number, pageNumber: number) => {
    return atom(async (get) => {
      const index = pageNumber - 1
      const cache = store.get(rawDataPagesAtom)

      if (index < cache.length) {
        const page = cache[index]
        return {
          rows: page.rows,
          nextPageToken: page.nextPageToken,
        } satisfies DataPage<TData>
      }

      const currentNextPageToken = cache[cache.length - 1]?.nextPageToken
      const { rows, nextPageToken } = await get(fetchNextPage(pageSize, currentNextPageToken))

      get(syncEffectBuilder({ rows, nextPageToken }))

      return {
        rows: rows,
        nextPageToken,
      } satisfies DataPage<TData>
    })
  }

  const useViewModelPageAtom = (pageSize: number, pageNumber: number) => {
    const store = useStore()

    return useMemo(() => {
      return getViewModelPageAtomBuilder(store, pageSize, pageNumber)
    }, [store, pageSize, pageNumber])
  }

  const useLoadablePage = (pageNumber: number) => {
    return useAtomValue(loadable(useViewModelPageAtom(pageSize, pageNumber)))
  }

  return { useLoadablePage } as const
}
