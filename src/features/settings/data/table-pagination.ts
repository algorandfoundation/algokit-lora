import { atom, SetStateAction, useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { settingsStore } from '@/features/settings/data'
import { useCallback, useMemo } from 'react'
import { PaginationState } from '@tanstack/react-table'

export type TableDataContext = 'transaction' | 'application' | 'asset' | 'applicationState' | 'networkConfig' | 'appSpec'
type TablePageSizes = Partial<Record<TableDataContext, PageSizeOption>>
type PageSizeOption = (typeof pageSizeOptions)[number]

export const pageSizeOptions = [10, 20, 30, 40, 50, 100] as const
const tablePageSizesAtom = atomWithStorage<TablePageSizes>('table-page-sizes', {}, undefined, { getOnInit: true })
const defaultPageSize: PageSizeOption = 10
const pageSizeOrDefault = (pageSize: number): PageSizeOption =>
  pageSizeOptions.includes(pageSize as PageSizeOption) ? (pageSize as PageSizeOption) : defaultPageSize

export const useTablePageSize = (context: TableDataContext) => {
  const [tablePageSizes, setTablePageSizes] = useAtom(tablePageSizesAtom, { store: settingsStore })
  const setPageSize = useCallback(
    (pageSize: number) => {
      setTablePageSizes((prev) => ({
        ...prev,
        [context]: pageSizeOrDefault(pageSize),
      }))
    },
    [context, setTablePageSizes]
  )

  const pageSize = tablePageSizes[context] ?? defaultPageSize

  return [pageSize, setPageSize] as const
}

export const useTablePagination = (context: TableDataContext) => {
  const paginationAtom = useMemo(() => {
    const pageIndexAtom = atom(0)

    return atom<PaginationState, [SetStateAction<PaginationState>], void>(
      (get) => {
        const pageIndex = get(pageIndexAtom)
        const pageSize = get(tablePageSizesAtom)[context] ?? defaultPageSize

        return {
          pageIndex,
          pageSize,
        }
      },
      (get, set, update: SetStateAction<PaginationState>) => {
        const pageIndex = get(pageIndexAtom)
        const pageSize = get(tablePageSizesAtom)[context] ?? defaultPageSize

        const nextValue =
          typeof update === 'function'
            ? update({
                pageIndex,
                pageSize,
              })
            : update

        if (pageIndex !== nextValue.pageIndex) {
          set(pageIndexAtom, nextValue.pageIndex)
        }

        const nextPageSize = pageSizeOrDefault(nextValue.pageSize)
        if (nextPageSize !== pageSize) {
          set(tablePageSizesAtom, (prev) => ({
            ...prev,
            [context]: nextPageSize,
          }))
        }
      }
    )
  }, [context])

  return useAtom(paginationAtom, { store: settingsStore })
}
