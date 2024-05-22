import { Atom, atom } from 'jotai'

export type LoadDataResponse<TData> = {
  items: TData[]
  nextPageToken?: string
}

type Input<TData> = {
  pageSize: number
  fetchData: (nextPageToken?: string) => Atom<Promise<LoadDataResponse<TData>>>
}

export function createLazyLoadPageAtom<TData>({ pageSize, fetchData }: Input<TData>) {
  let itemsAtom: TData[] = []
  let nextPageTokenAtom: string | undefined = undefined

  return (pageNumber: number) => {
    return atom(async (get) => {
      const index = pageNumber - 1

      const itemsFromCache = itemsAtom.slice(index * pageSize, (index + 1) * pageSize)

      if (itemsFromCache.length === pageSize) return itemsFromCache

      const { items, nextPageToken } = await get(fetchData(nextPageTokenAtom))
      const nextCache = Array.from(itemsAtom).concat(items)
      itemsAtom = nextCache
      nextPageTokenAtom = nextPageToken

      return nextCache.slice(index * pageSize, (index + 1) * pageSize)
    })
  }
}
