import { useCallback, useState } from 'react'
import { DialogBodyProps, useDialogForm } from '@/features/common/hooks/use-dialog-form'
import { Button } from '@/features/common/components/button'
import { TransactionBuilder } from './transaction-builder'
import { algorandClient } from '@/features/common/data/algo-client'
import { useWallet } from '@txnlab/use-wallet'
import { invariant } from '@/utils/invariant'
import { TransactionsGraph } from '@/features/transactions-graph'
import { DescriptionList } from '@/features/common/components/description-list'
import { transactionIdLabel } from '@/features/transactions/components/transaction-info'
import { TransactionLink } from '@/features/transactions/components/transaction-link'
import { asTransactionsGraphData } from '@/features/transactions-graph/mappers'
import { asTransactionFromSendResult } from '@/features/transactions/data/send-transaction-result'
import { SendTransactionResult, BuildTransactionResult, BuildableTransactionType } from '../models'
import { asAlgosdkTransactions, asDescriptionListItems } from '../mappers'
import { ColumnDef, flexRender, getCoreRowModel, Row, useReactTable } from '@tanstack/react-table'
import { SortableDataTable, RowDragHandleCell } from '@/features/common/components/sortable-data-table'
import { Table, TableBody, TableCell, TableRow } from '@/features/common/components/table'
import { cn } from '@/features/common/utils'

export const transactionTypeLabel = 'Transaction type'
export const sendButtonLabel = 'Send'

type Props = {
  // TODO: PD - transactions from props can't be removed
  transactions?: BuildTransactionResult[]
}

export function TransactionsBuilder({ transactions: transactionsProp }: Props) {
  const { activeAddress, signer } = useWallet()
  const [transactions, setTransactions] = useState<BuildTransactionResult[]>(transactionsProp ?? [])
  const [sendTransactionResult, setSendTransactionResult] = useState<SendTransactionResult | undefined>(undefined)

  const { open, dialog } = useDialogForm({
    dialogHeader: 'Transaction Builder',
    dialogBody: (props: DialogBodyProps<number, BuildTransactionResult>) => (
      <TransactionBuilder onCancel={props.onCancel} onSubmit={props.onSubmit} />
    ),
  })

  const openDialog = useCallback(async () => {
    // TODO: PD - 1??
    const transaction = await open(1)
    if (transaction) {
      setTransactions((prev) => [...prev, transaction])
    }
  }, [open])

  const sendTransactions = useCallback(async () => {
    invariant(activeAddress, 'Please connect your wallet')

    const atc = algorandClient.setSigner(activeAddress, signer).newGroup()
    for (const transaction of transactions) {
      const txns = await asAlgosdkTransactions(transaction)
      txns.forEach((txn) => atc.addTransaction(txn))
    }
    const result = await atc.execute()
    const sentTxns = asTransactionFromSendResult(result)
    const transactionId = result.txIds[0]
    const transactionsGraphData = asTransactionsGraphData(sentTxns)

    setSendTransactionResult({
      transactionId,
      transactionsGraphData,
    })
  }, [activeAddress, signer, transactions])

  return (
    <div>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={openDialog}>Create</Button>
        </div>
        <SortableDataTable
          columns={tableColumns}
          data={transactions}
          setData={setTransactions}
          renderRow={renderTransaction}
          subRowsExpanded={true}
        />
        <Button onClick={sendTransactions}>Send</Button>
      </div>
      {dialog}
      {sendTransactionResult && (
        <div className="my-4 flex flex-col gap-4 text-sm">
          <DescriptionList
            items={[
              {
                dt: transactionIdLabel,
                dd: (
                  <TransactionLink transactionId={sendTransactionResult.transactionId} className="text-sm text-primary underline">
                    {sendTransactionResult.transactionId}
                  </TransactionLink>
                ),
              },
            ]}
          />
          <TransactionsGraph
            transactionsGraphData={sendTransactionResult.transactionsGraphData}
            bgClassName="bg-background"
            downloadable={false}
          />
        </div>
      )}
    </div>
  )
}

// TODO: PD - fixed width all the columns
const tableColumns: ColumnDef<BuildTransactionResult>[] = [
  {
    id: 'drag-handle',
    header: '',
    cell: ({ row }) => <RowDragHandleCell rowId={row.id} />,
    meta: { className: 'w-8' },
  },
  {
    header: 'Type',
    accessorFn: (item) => item.type,
    meta: { className: 'w-24' },
  },
  {
    header: 'Description',
    cell: (c) => {
      const transaction = c.row.original
      return <DescriptionList items={asDescriptionListItems(transaction)} />
    },
  },
]

const renderTransaction = (row: Row<BuildTransactionResult>): React.ReactNode => {
  const transaction = row.original
  const subTransactionsTable = renderSubTransactions(transaction)

  return (
    <>
      {subTransactionsTable && (
        <TableRow className="border-t">
          <TableCell></TableCell>
          <TableCell className="p-0" colSpan={row.getVisibleCells().length - 1}>
            {subTransactionsTable}
          </TableCell>
        </TableRow>
      )}
      <TableRow data-state={row.getIsSelected() && 'selected'}>
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id} className={cn(cell.column.columnDef.meta?.className)}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    </>
  )
}

const renderSubTransactions = (transaction: BuildTransactionResult): React.ReactNode => {
  if (transaction.type !== BuildableTransactionType.AppCall) {
    return undefined
  }
  const subTransactions = transaction.methodArgs?.filter((arg): arg is BuildTransactionResult => typeof arg === 'object') ?? []
  return <SubTransactionsTable subTransactions={subTransactions} />
}

function SubTransactionsTable({ subTransactions }: { subTransactions: BuildTransactionResult[] }) {
  const table = useReactTable({
    data: subTransactions,
    columns: tableColumns.slice(1),
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="grid">
      <Table>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
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
        </TableBody>
      </Table>
    </div>
  )
}
