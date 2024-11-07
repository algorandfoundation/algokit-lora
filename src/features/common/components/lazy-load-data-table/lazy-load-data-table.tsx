import { ColumnDef, ExpandedState, flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/features/common/components/table'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { LazyLoadDataTablePagination } from './lazy-load-data-table-pagination'
import { Loader2 as Loader } from 'lucide-react'
import { Loadable } from 'jotai/vanilla/utils/loadable'
import { ViewModelPage } from '../../data/lazy-load-pagination'
import { cn } from '../../utils'

interface Props<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  createLoadablePage: (pageSize: number) => (pageNumber: number) => Loadable<Promise<ViewModelPage<TData>>>
  getSubRows?: (row: TData) => TData[]
  subRowsExpanded?: boolean
}

export function LazyLoadDataTable<TData, TValue>({ columns, createLoadablePage, getSubRows, subRowsExpanded }: Props<TData, TValue>) {
  const [pageSize, setPageSize] = useState(10)
  const useLoadablePage = useMemo(() => createLoadablePage(pageSize), [createLoadablePage, pageSize])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const loadablePage = useLoadablePage(currentPage)
  const [expanded, setExpanded] = useState<ExpandedState>({})
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
    data: page?.items ?? [],
    state: {
      expanded: expanded,
    },
    onExpandedChange: setExpanded,
    getSubRows: getSubRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    manualPagination: true,
  })

  useEffect(() => {
    table.toggleAllRowsExpanded(subRowsExpanded ?? false)
  }, [subRowsExpanded, table])

  return (
    <div>
      <div className="grid">
        <Table className="border-b">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-t bg-muted hover:bg-muted">
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
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center">
                    <Loader className="size-10 animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            )}
            {loadablePage.state === 'hasError' && (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Failed to load data.
                </TableCell>
              </TableRow>
            )}
            {loadablePage.state === 'hasData' &&
              table.getRowModel().rows.length > 0 &&
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  {...(row.getCanExpand() ? { className: 'cursor-pointer', onClick: row.getToggleExpandedHandler() } : {})}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cn(cell.column.columnDef.meta?.className)}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
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
        nextPageEnabled={!!page?.hasNextPage}
        nextPage={nextPage}
        previousPageEnabled={currentPage > 1}
        previousPage={previousPage}
      />
    </div>
  )
}
