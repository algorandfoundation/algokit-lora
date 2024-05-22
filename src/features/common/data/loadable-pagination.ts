import { Atom, atom } from 'jotai'
import { JotaiStore } from './types'

export type LoadDataResponse<TData> = {
  items: TData[]
  nextPageToken?: string
}

type CreateLoadablePaginationInput<TData> = {
  pageSize: number
  fetchData: (nextPageToken?: string) => Atom<Promise<LoadDataResponse<TData>>>
}

export function createLoadablePagination<TData>({ pageSize, fetchData }: CreateLoadablePaginationInput<TData>) {
  const itemsAtom = atom<TData[]>([])
  const nextPageTokenAtom = atom<string | undefined>(undefined)

  const createPageAtom = (store: JotaiStore, pageNumber: number) => {
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

  return createPageAtom
}
