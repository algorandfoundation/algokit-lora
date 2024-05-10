import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/features/common/components/table'
import { useCallback, useMemo, useState } from 'react'
import { Atom } from 'jotai'
import { DataPage, loadablePaginationBuilder } from '../../data/loadable-pagination-builder'
import { LazyLoadDataTablePagination } from './lazy-load-data-table-pagination'
import { RenderLoadable } from '../render-loadable'

interface Props<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  fetchNextPage: (pageSize: number, nextPageToken?: string) => Atom<Promise<DataPage<TData>>>
}

export function LazyLoadDataTable<TData, TValue>({ columns, fetchNextPage }: Props<TData, TValue>) {
  const [pageSize, setPageSize] = useState(10)
  const { useLoadablePage } = useMemo(
    () =>
      loadablePaginationBuilder({
        pageSize,
        fetchNextPage,
      }),
    [pageSize, fetchNextPage]
  )
  const [currentPage, setCurrentPage] = useState<number>(1)
  const loadablePage = useLoadablePage(currentPage)

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => prev + 1)
  }, [])

  const previousPage = useCallback(() => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev))
  }, [])

  const setPageSizeAndResetCurrentPage = useCallback((newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1)
  }, [])

  const page = useMemo(() => (loadablePage.state === 'hasData' ? loadablePage.data : undefined), [loadablePage])

  const table = useReactTable({
    data: page?.rows ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  })

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
          <RenderLoadable loadable={loadablePage}>
            {(_) => {
              return (
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
              )
            }}
          </RenderLoadable>
        </Table>
      </div>
      <LazyLoadDataTablePagination
        pageSize={pageSize}
        setPageSize={setPageSizeAndResetCurrentPage}
        currentPage={currentPage}
        nextPageEnabled={!!page?.nextPageToken && page.rows.length === pageSize}
        nextPage={nextPage}
        previousPageEnabled={currentPage > 1}
        previousPage={previousPage}
      />
    </div>
  )
}
