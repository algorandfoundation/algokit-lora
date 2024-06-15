import { ColumnDef, ExpandedState, flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/features/common/components/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../common/components/select'
import { useEffect, useState } from 'react'
import { InnerTransaction, Transaction } from '@/features/transactions/models'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { useLiveTransactions } from '../data/live-transaction'

interface Props {
  columns: ColumnDef<Transaction>[]
  filter: (transactionResult: TransactionResult) => boolean
  getSubRows?: (row: Transaction | InnerTransaction) => InnerTransaction[]
}

export function LiveTransactionsTable({ filter, columns, getSubRows }: Props) {
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [maxRows, setMaxRows] = useState(10)
  const transactions = useLiveTransactions(filter, maxRows)

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
  })

  useEffect(() => {
    table.toggleAllRowsExpanded(true)
  }, [table])

  return (
    <div>
      <div className="grid border-y">
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
      <div className="mt-2 flex items-center justify-between">
        <div className="flex w-full">
          <div className="flex shrink grow basis-0 items-center justify-start space-x-2">
            <p className="text-sm font-medium">Max rows</p>
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
      </div>
    </div>
  )
}

const maxRowsOptions = [10, 20, 30, 40, 50]
