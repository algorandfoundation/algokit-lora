import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/features/common/components/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../common/components/select'
import { useMemo, useState } from 'react'
import { liveTransactionIdsAtom, transactionResultsAtom } from '@/features/transactions/data'
import { InnerTransaction, Transaction } from '@/features/transactions/models'
import { atomEffect } from 'jotai-effect'
import { Atom, atom, useAtom, useAtomValue, useStore } from 'jotai'
import { TransactionId } from '@/features/transactions/data/types'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { JotaiStore } from '@/features/common/data/types'

interface Props {
  columns: ColumnDef<Transaction>[]
  mapper: (store: JotaiStore, transactionResult: TransactionResult) => Atom<Promise<(Transaction | InnerTransaction)[]>>
}

export function LiveTransactionsTable({ mapper, columns }: Props) {
  const [maxRows, setMaxRows] = useState(10)
  const transactions = useLiveTransactions(mapper, maxRows)
  const table = useReactTable({
    data: transactions,
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

const useLiveTransactions = (
  mapper: (store: JotaiStore, transactionResult: TransactionResult) => Atom<Promise<(Transaction | InnerTransaction)[]>>,
  maxRows: number
) => {
  const store = useStore()

  const { liveTransactionsAtomEffect, liveTransactionsAtom } = useMemo(() => {
    const syncedTransactionIdAtom = atom<TransactionId | undefined>(undefined)
    const liveTransactionsAtom = atom<(Transaction | InnerTransaction)[]>([])

    const liveTransactionsAtomEffect = atomEffect((get, set) => {
      ;(async () => {
        const transactionResults = get(transactionResultsAtom)
        const liveTransactionIds = get(liveTransactionIdsAtom)
        const syncedTransactionId = get(syncedTransactionIdAtom)

        set(syncedTransactionIdAtom, liveTransactionIds[0])
        const newTransactionResults: TransactionResult[] = []
        for (const transactionId of liveTransactionIds) {
          if (transactionId === syncedTransactionId) {
            break
          }
          const transactionResultAtom = transactionResults.get(transactionId)

          if (!transactionResultAtom) {
            // Ignore if the transaction is not in the transactionResultsAtom
            // Very unlikely to happen
            continue
          }

          const transactionResult = await get.peek(transactionResultAtom)
          newTransactionResults.push(transactionResult)
        }
        const newTransactions = (
          await Promise.all(newTransactionResults.map((transactionResult) => get(mapper(store, transactionResult))))
        ).flat()

        if (newTransactions.length) {
          set(liveTransactionsAtom, (prev) => {
            return newTransactions.concat(prev).slice(0, maxRows)
          })
        }
      })()
    })

    return {
      liveTransactionsAtomEffect,
      liveTransactionsAtom,
    }
  }, [store, mapper, maxRows])

  useAtom(liveTransactionsAtomEffect)

  const transactions = useAtomValue(liveTransactionsAtom)
  return transactions
}
