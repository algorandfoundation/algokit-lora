import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/features/common/components/table'
import { useCallback, useMemo, useState } from 'react'
import { Atom } from 'jotai'
import { JotaiStore } from '../../data/types'
import { RenderLoadable } from '../render-loadable'
import { RawDataPage, loadablePaginationBuilder } from '../../data/loadable-pagination-builder'

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
