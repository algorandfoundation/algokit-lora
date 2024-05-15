import { Atom, atom, useAtomValue, useStore } from 'jotai'
import { atomEffect } from 'jotai-effect'
import { loadable } from 'jotai/utils'
import { JotaiStore } from './types'
import { useMemo } from 'react'

export type DataPage<TData> = {
  rows: TData[]
  nextPageToken?: string
}

type CreateLoadablePaginationInput<TData> = {
  pageSize: number
  fetchNextPage: (pageSize: number, nextPageToken?: string) => Atom<Promise<DataPage<TData>>>
}

export function createLoadablePagination<TData>({ pageSize, fetchNextPage }: CreateLoadablePaginationInput<TData>) {
  const rawDataPagesAtom = atom<DataPage<TData>[]>([])

  const createSyncEffect = ({ rows, nextPageToken }: { rows: TData[]; nextPageToken?: string }) => {
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

  const createPageAtom = (store: JotaiStore, pageSize: number, pageNumber: number) => {
    return atom(async (get) => {
      const index = pageNumber - 1
      const cache = store.get(rawDataPagesAtom)

      if (index < cache.length) {
        return cache[index] satisfies DataPage<TData>
      }

      const currentNextPageToken = cache[cache.length - 1]?.nextPageToken
      const { rows, nextPageToken } = await get(fetchNextPage(pageSize, currentNextPageToken))

      get(createSyncEffect({ rows, nextPageToken }))

      return {
        rows: rows,
        nextPageToken,
      } satisfies DataPage<TData>
    })
  }

  const usePageAtom = (pageSize: number, pageNumber: number) => {
    const store = useStore()

    return useMemo(() => {
      return createPageAtom(store, pageSize, pageNumber)
    }, [store, pageSize, pageNumber])
  }

  const useLoadablePage = (pageNumber: number) => {
    return useAtomValue(loadable(usePageAtom(pageSize, pageNumber)))
  }

  return { useLoadablePage } as const
}
