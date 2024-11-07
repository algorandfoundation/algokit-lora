import { ColumnDef, ExpandedState, flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/features/common/components/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../common/components/select'
import { useEffect, useState } from 'react'
import { InnerTransaction, Transaction } from '@/features/transactions/models'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { useLiveTransactions } from '../data/live-transaction'
import { cn } from '@/features/common/utils'
import { Switch } from '@/features/common/components/switch'
import { Label } from '@/features/common/components/label'

interface Props {
  columns: ColumnDef<Transaction>[]
  filter: (transactionResult: TransactionResult) => boolean
  getSubRows?: (row: Transaction | InnerTransaction) => InnerTransaction[]
}

export function LiveTransactionsTable({ filter, columns, getSubRows }: Props) {
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [maxRows, setMaxRows] = useState(10)
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
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
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
            <Select value={`${maxRows}`} onValueChange={(value) => setMaxRows(Number(value))}>
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={`${maxRows}`} />
              </SelectTrigger>
              <SelectContent side="top">
                {maxRowsOptions.map((option) => (
                  <SelectItem key={option} value={`${option}`}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="ml-auto flex items-center space-x-2">
          <Switch id="live-view-enabled" onCheckedChange={(checked) => setShowLiveUpdates(checked)} checked={showLiveUpdates} />
          <Label htmlFor="live-view-enabled" className="cursor-pointer">
            Show updates
          </Label>
        </div>
      </div>
    </div>
  )
}

const maxRowsOptions = [10, 20, 30, 40, 50]
