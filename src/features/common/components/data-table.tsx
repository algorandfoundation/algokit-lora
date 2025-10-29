import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getExpandedRowModel,
  ExpandedState,
} from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/features/common/components/table'
import { DataTablePagination } from './data-table-pagination'
import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/features/common/utils'
import { TableDataContext } from '../../settings/data/table-pagination'
import { useTablePagination } from '@/features/settings/data/table-pagination'
import { MESSAGE_TABLE_ROW_DATA_LABEL, NO_RESULTS_TABLE_MESSAGE } from '../constants'
import { Loadable } from 'jotai/vanilla/utils/loadable'
import { Loader2 as Loader } from 'lucide-react'
import { asError } from '@/utils/error'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[] | Loadable<TData[]>
  getSubRows?: (row: TData) => TData[]
  subRowsExpanded?: boolean
  ariaLabel?: string
  hidePagination?: boolean
  dataContext: TableDataContext
}

export function DataTable<TData, TValue>({
  columns,
  data: _data,
  getSubRows,
  subRowsExpanded,
  ariaLabel,
  hidePagination,
  dataContext,
}: DataTableProps<TData, TValue>) {
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [pagination, setPagination] = useTablePagination(dataContext)

  const updatePagination: Parameters<typeof useReactTable<TData>>[0]['onPaginationChange'] = (updaterOrValue) => {
    setPagination((prev) => (typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue))
  }

  const [data, reason] = useMemo<[TData[], React.ReactNode | undefined]>(() => {
    if (Array.isArray(_data)) {
      return [_data, undefined]
    }
    switch (_data.state) {
      case 'hasData':
        return [_data.data, undefined]
      case 'hasError': {
        const error = asError(_data.error)
        return [[], error.message]
      }
      default:
        return [[], <Loader className="mx-auto size-10 animate-spin" />]
    }
  }, [_data])

  const table = useReactTable({
    data,
    paginateExpandedRows: false,
    state: {
      expanded: expanded,
      pagination,
    },
    onExpandedChange: setExpanded,
    onPaginationChange: updatePagination,
    getSubRows: getSubRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  useEffect(() => {
    table.toggleAllRowsExpanded(subRowsExpanded ?? false)
  }, [subRowsExpanded, table])

  return (
    <div>
      <div className="grid">
        <Table className="border-b" aria-label={ariaLabel}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted hover:bg-muted border-t">
                {headerGroup.headers.map((header) => {
                  // meta.className is used to set the class name for the header cell if it exists
                  const className = header.column.columnDef.meta?.className
                  return (
                    <TableHead key={header.id} className={cn(className)}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length > 0 ? (
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
              ))
            ) : (
              <TableRow aria-label={MESSAGE_TABLE_ROW_DATA_LABEL}>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {reason ? reason : NO_RESULTS_TABLE_MESSAGE}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {!hidePagination && <DataTablePagination table={table} />}
    </div>
  )
}
