import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { settingsStore } from '@/features/settings/data'

export type TableDataContext = 'transaction' | 'application' | 'asset' | 'applicationState' | 'networkConfig' | 'appSpec'
type TablePageSizes = Partial<Record<TableDataContext, PageSizeOption>>
type PageSizeOption = (typeof pageSizeOptions)[number]

export const pageSizeOptions = [10, 20, 30, 40, 50, 100] as const
const tablePageSizesAtom = atomWithStorage<TablePageSizes>('table-page-sizes', {}, undefined, { getOnInit: true })
const defaultPageSize: PageSizeOption = 10

export const useTablePageSize = (context: TableDataContext) => {
  const [tablePageSizes, setTablePageSizes] = useAtom(tablePageSizesAtom, { store: settingsStore })

  const setPageSize = (pageSize: number) => {
    if (!pageSizeOptions.includes(pageSize as PageSizeOption)) {
      throw new Error(`Invalid page size: ${pageSize}. Must be one of ${pageSizeOptions.join(', ')}.`)
    }
    const nextPageSize = pageSizeOptions.includes(pageSize as PageSizeOption) ? (pageSize as PageSizeOption) : defaultPageSize

    setTablePageSizes((prev) => ({
      ...prev,
      [context]: nextPageSize,
    }))
  }

  const pageSize = tablePageSizes[context] ?? defaultPageSize

  return [pageSize, setPageSize] as const
}
