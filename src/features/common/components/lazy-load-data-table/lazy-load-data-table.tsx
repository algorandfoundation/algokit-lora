import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/features/common/components/table'
import { useCallback, useMemo, useState } from 'react'
import { Atom, atom, useAtomValue, useStore } from 'jotai'
import { atomEffect } from 'jotai-effect'
import { JotaiStore } from '../../data/types'
import { loadable } from 'jotai/utils'
import { RenderLoadable } from '../render-loadable'

interface Props<TData, TViewModel, TValue> {
  columns: ColumnDef<TViewModel, TValue>[]
  fetchNextPage: (nextPageToken?: string) => Promise<RawDataPage<TData>>
  mapper: (store: JotaiStore, rows: TData[]) => Atom<Promise<TViewModel[]>>
}

export function LazyLoadDataTable<TData, TViewModel, TValue>({ columns, fetchNextPage, mapper }: Props<TData, TViewModel, TValue>) {
  // TODO: consider having a callback so that the consumer can set the transaction results atom
  // TODO: test nextPageEnabled, previousPageEnabled
  const { useLoadablePage } = useMemo(
    () =>
      loadablePaginationBuilder({
        fetchNextPage,
        mapper,
      }),
    [fetchNextPage, mapper]
  )
  const [currentPage, setCurrentPage] = useState<number>(1)
  const loadablePage = useLoadablePage(currentPage)

  return (
    <RenderLoadable loadable={loadablePage}>
      {(page) => (
        <LazyLoadDataTableInner
          data={page.rows}
          columns={columns}
          nextPageEnabled={page.nextPageToken !== undefined}
          nextPage={() => {
            setCurrentPage((prev) => prev + 1)
          }}
          currentPage={currentPage}
          previousPageEnabled={currentPage > 1}
          previousPage={() => {
            setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev))
          }}
        />
      )}
    </RenderLoadable>
  )
}

interface InnerProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  currentPage: number
  nextPageEnabled: boolean
  nextPage: () => void
  previousPageEnabled: boolean
  previousPage: () => void
}
export function LazyLoadDataTableInner<TData, TValue>({ columns, data, currentPage, nextPage, previousPage }: InnerProps<TData, TValue>) {
  const table = useReactTable({
    data: data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  })

  const nextPageButtonClicked = useCallback(async () => {
    nextPage()
  }, [nextPage])
  const previousPageButtonClicked = useCallback(async () => {
    previousPage()
  }, [previousPage])

  return (
    <div>
      <div className="grid rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="space-x-4">
        <button onClick={previousPageButtonClicked}>Previous</button>
        <label>{currentPage}</label>
        <button onClick={nextPageButtonClicked}>Next</button>
      </div>
    </div>
  )
}

type RawDataPage<TData> = {
  rows: TData[]
  nextPageToken?: string
}

type ViewModelPage<TViewModel> = {
  rows: TViewModel[]
  nextPageToken?: string
}

type LoadablePaginationBuilderInput<TData, TViewModel> = {
  fetchNextPage: (nextPageToken?: string) => Promise<RawDataPage<TData>>
  mapper: (store: JotaiStore, rows: TData[]) => Atom<Promise<TViewModel[]>>
}

function loadablePaginationBuilder<TData, TViewModel>({ fetchNextPage, mapper }: LoadablePaginationBuilderInput<TData, TViewModel>) {
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
