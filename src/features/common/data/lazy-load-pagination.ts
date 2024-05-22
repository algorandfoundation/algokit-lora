import { Atom, atom, useAtomValue, useStore } from 'jotai'
import { JotaiStore } from './types'
import { useMemo } from 'react'
import { loadable } from 'jotai/utils'

export type LoadDataResponse<TData> = {
  items: TData[]
  nextPageToken?: string
}

type CreateLazyLoadRawDataPageAtom<TData> = {
  pageSize: number
  fetchData: (nextPageToken?: string) => Atom<Promise<LoadDataResponse<TData>>>
}

function createLazyLoadRawDataPageAtom<TData>({ pageSize, fetchData }: CreateLazyLoadRawDataPageAtom<TData>) {
  const itemsAtom = atom<TData[]>([])
  const nextPageTokenAtom = atom<string | undefined>(undefined)

  return (store: JotaiStore, pageNumber: number) => {
    return atom(async (get) => {
      const index = pageNumber - 1

      const cache = store.get(itemsAtom)
      const itemsFromCache = cache.slice(index * pageSize, (index + 1) * pageSize)

      if (itemsFromCache.length === pageSize) return itemsFromCache

      const { items, nextPageToken } = await get(fetchData(store.get(nextPageTokenAtom)))
      const nextCache = Array.from(cache).concat(items)

      store.set(itemsAtom, nextCache)
      store.set(nextPageTokenAtom, nextPageToken)

      return nextCache.slice(index * pageSize, (index + 1) * pageSize)
    })
  }
}

type CreateLoadableViewModelPageAtomInput<TRawData, TViewModel> = {
  fetchRawData: (nextPageToken?: string) => Atom<
    Promise<{
      items: TRawData[]
      nextPageToken?: string
    }>
  >
  createViewModelPageAtom: (store: JotaiStore, rawDataPage: TRawData[]) => Atom<Promise<TViewModel[]> | TViewModel[]>
}
export function createLoadableViewModelPageAtom<TRawData, TViewModel>({
  fetchRawData,
  createViewModelPageAtom,
}: CreateLoadableViewModelPageAtomInput<TRawData, TViewModel>) {
  return (pageSize: number) => {
    const lazyLoadRawDataPageAtom = createLazyLoadRawDataPageAtom({ pageSize, fetchData: fetchRawData })

    const createPageAtom = (store: JotaiStore, pageNumber: number) => {
      return atom(async (get) => {
        const rawDataPage = await get(lazyLoadRawDataPageAtom(store, pageNumber))
        return get(createViewModelPageAtom(store, rawDataPage))
      })
    }

    const usePageAtom = (pageNumber: number) => {
      const store = useStore()

      return useMemo(() => {
        return createPageAtom(store, pageNumber)
      }, [store, pageNumber])
    }

    const useLoadablePage = (pageNumber: number) => {
      return useAtomValue(loadable(usePageAtom(pageNumber)))
    }

    return { useLoadablePage }
  }
}
