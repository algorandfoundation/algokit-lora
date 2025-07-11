import { ColumnDef, ExpandedState, flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/features/common/components/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../common/components/select'
import { useCallback, useEffect, useState } from 'react'
import { InnerTransaction, Transaction } from '@/features/transactions/models'
import { TransactionResult } from '@/features/transactions/data/types'
import { useLiveTransactions } from '../data/live-transaction'
import { cn } from '@/features/common/utils'
import { Switch } from '@/features/common/components/switch'
import { Label } from '@/features/common/components/label'
import { pageSizeOptions, useTablePageSize } from '@/features/settings/data/table-pagination'
import { MESSAGE_TABLE_ROW_DATA_LABEL, NO_RESULTS_TABLE_MESSAGE } from '@/features/common/constants'

interface Props {
  columns: ColumnDef<Transaction>[]
  filter: (transactionResult: TransactionResult) => boolean
  getSubRows?: (row: Transaction | InnerTransaction) => InnerTransaction[]
}

export function LiveTransactionsTable({ filter, columns, getSubRows }: Props) {
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [maxRows, setMaxRows] = useTablePageSize('transaction')
  const { transactions, showLiveUpdates, setShowLiveUpdates } = useLiveTransactions(filter, maxRows)

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    getSubRows: getSubRows,
    getExpandedRowModel: getExpandedRowModel(),
    state: {
      expanded: expanded,
    },
    onExpandedChange: setExpanded,
    getRowId: (transaction) => transaction.id,
  })

  useEffect(() => {
    table.toggleAllRowsExpanded(true)
  }, [table])

  const updateMaxRows = useCallback(
    (newMaxRows: string) => {
      setMaxRows(Number(newMaxRows))
    },
    [setMaxRows]
  )

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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={cn('animate-in fade-in-20', row.getCanExpand() && 'cursor-pointer')}
                  {...(row.getCanExpand() ? { onClick: row.getToggleExpandedHandler() } : {})}
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
                  {NO_RESULTS_TABLE_MESSAGE}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="flex">
          <div className="flex shrink grow basis-0 items-center justify-start gap-2">
            <p className="hidden text-sm font-medium md:flex">Max rows</p>
            <Select value={`${maxRows}`} onValueChange={updateMaxRows}>
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={`${maxRows}`} />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((maxRows) => (
                  <SelectItem key={maxRows} value={`${maxRows}`}>
                    {maxRows}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="ml-auto flex items-center space-x-2">
          <Switch id="live-view-enabled" onCheckedChange={setShowLiveUpdates} checked={showLiveUpdates} />
          <Label htmlFor="live-view-enabled" className="cursor-pointer">
            Show updates
          </Label>
        </div>
      </div>
    </div>
  )
}
