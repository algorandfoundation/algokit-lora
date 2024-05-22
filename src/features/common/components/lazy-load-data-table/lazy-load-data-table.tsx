import { ColumnDef, flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/features/common/components/table'
import { useCallback, useMemo, useState } from 'react'
import { Atom } from 'jotai'
import { LoadDataResponse, createLoadablePagination } from '../../data/loadable-pagination'
import { LazyLoadDataTablePagination } from './lazy-load-data-table-pagination'
import { Loader2 as Loader } from 'lucide-react'

interface Props<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  fetchData: (nextPageToken?: string) => Atom<Promise<LoadDataResponse<TData>>>
  getSubRows?: (row: TData) => TData[]
}

export function LazyLoadDataTable<TData, TValue>({ columns, fetchData, getSubRows }: Props<TData, TValue>) {
  const [pageSize, setPageSize] = useState(10)
  const { useLoadablePage } = useMemo(
    () =>
      createLoadablePagination({
        pageSize,
        fetchData: fetchData,
      }),
    [pageSize, fetchData]
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
    data: page ?? [],
    state: {
      expanded: true,
    },
    getSubRows: getSubRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
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
          <TableBody>
            {loadablePage.state === 'loading' && (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <div className="flex flex-col items-center">
                    <Loader className="size-10 animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            )}
            {loadablePage.state === 'hasError' && (
              <TableRow>
                <TableCell colSpan={columns.length}>Failed to load data.</TableCell>
              </TableRow>
            )}
            {loadablePage.state === 'hasData' &&
              table.getRowModel().rows.length > 0 &&
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))}
            {loadablePage.state === 'hasData' && table.getRowModel().rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <LazyLoadDataTablePagination
        pageSize={pageSize}
        setPageSize={setPageSizeAndResetCurrentPage}
        currentPage={currentPage}
        nextPageEnabled={true}
        nextPage={nextPage}
        previousPageEnabled={currentPage > 1}
        previousPage={previousPage}
      />
    </div>
  )
}
