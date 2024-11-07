import { ColumnDef, flexRender, getCoreRowModel, Row, useReactTable } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/features/common/components/table'
import { CSSProperties, useMemo } from 'react'
import { cn } from '@/features/common/utils'
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { EllipsisVertical, GripVertical, Link2Icon, PlusCircle } from 'lucide-react'
import {
  BuildableTransactionType,
  BuildAppCallTransactionResult,
  BuildMethodCallTransactionResult,
  BuildTransactionResult,
  TransactionPositionsInGroup,
  PlaceholderTransaction,
  FulfilledByTransaction,
} from '../models'
import { DescriptionList } from '@/features/common/components/description-list'
import { asDescriptionListItems, asTransactionLabelFromBuildableTransactionType, asTransactionLabelFromTransactionType } from '../mappers'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/features/common/components/dropdown-menu'
import { isBuildTransactionResult } from '../utils/transaction-result-narrowing'
import { transactionActionsLabel } from './labels'
import { Button } from '@/features/common/components/button'

export const RowDragHandleCell = ({ rowId }: { rowId: string }) => {
  const { attributes, listeners } = useSortable({
    id: rowId,
  })
  return (
    <button className="flex w-full cursor-move items-center justify-center py-4" {...attributes} {...listeners}>
      <GripVertical size={16} />
    </button>
  )
}

function TransactionRow({
  row,
  transactionPositions,
  onEditTransaction,
  onEditResources,
}: {
  row: Row<BuildTransactionResult>
  transactionPositions: TransactionPositionsInGroup
  onEditTransaction: (transaction: BuildTransactionResult | PlaceholderTransaction) => Promise<void>
  onEditResources: (transaction: BuildAppCallTransactionResult | BuildMethodCallTransactionResult) => Promise<void>
}) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.id,
  })

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform), //let dnd-kit do its thing
    transition: transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1 : 0,
    position: 'relative',
  }

  return (
    <TableBody ref={setNodeRef} style={style}>
      <SubTransactionsRows
        transaction={row.original}
        transactionPositions={transactionPositions}
        onEditTransaction={onEditTransaction}
        onEditResources={onEditResources}
      />
      <TableRow data-state={row.getIsSelected() && 'selected'}>
        <TableCell className="w-10 border-b">
          <RowDragHandleCell rowId={row.id} />
        </TableCell>
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id} className={cn(cell.column.columnDef.meta?.className, 'border-b')}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    </TableBody>
  )
}

type Props = {
  data: BuildTransactionResult[]
  setData: (data: BuildTransactionResult[]) => void
  ariaLabel?: string
  onEditTransaction: (transaction: BuildTransactionResult | PlaceholderTransaction | FulfilledByTransaction) => Promise<void>
  onEditResources: (transaction: BuildAppCallTransactionResult | BuildMethodCallTransactionResult) => Promise<void>
  onDelete: (transaction: BuildTransactionResult) => void
  nonDeletableTransactionIds: string[]
}

export function TransactionsTable({
  data,
  setData,
  ariaLabel,
  onEditTransaction,
  onEditResources,
  onDelete,
  nonDeletableTransactionIds,
}: Props) {
  const transactionPositions = useMemo(() => calculatePositions(data), [data])

  const columns = getTableColumns({ onEditTransaction, onEditResources, onDelete, nonDeletableTransactionIds, transactionPositions })

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  })

  const dataIds = useMemo<string[]>(() => data.map((d) => d.id), [data])

  // reorder rows after drag & drop
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      const oldIndex = dataIds.indexOf(active.id.toString())
      const newIndex = dataIds.indexOf(over.id.toString())
      const newData = arrayMove(data, oldIndex, newIndex) //this is just a splice util
      setData(newData)
    }
  }

  const sensors = useSensors(useSensor(MouseSensor, {}), useSensor(TouchSensor, {}), useSensor(KeyboardSensor, {}))

  return (
    <DndContext collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} onDragEnd={handleDragEnd} sensors={sensors}>
      <div className="grid">
        <Table aria-label={ariaLabel} className="border-separate border-spacing-0 overflow-hidden">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="relative z-10 bg-muted hover:bg-muted">
                <TableHead className="w-10 border-y"></TableHead>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="border-y">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
            {table.getRowModel().rows?.length ? (
              table
                .getRowModel()
                .rows.map((row) => (
                  <TransactionRow
                    key={row.id}
                    row={row}
                    transactionPositions={transactionPositions}
                    onEditTransaction={onEditTransaction}
                    onEditResources={onEditResources}
                  />
                ))
            ) : (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                    No transactions.
                  </TableCell>
                </TableRow>
              </TableBody>
            )}
          </SortableContext>
        </Table>
      </div>
    </DndContext>
  )
}

const calculatePositions = (transactions: BuildTransactionResult[]): TransactionPositionsInGroup => {
  let index = 1
  return transactions.reduce((acc, transaction) => {
    if (transaction.type !== BuildableTransactionType.MethodCall) {
      acc.set(transaction.id, index++)
      return acc
    } else {
      getSubTransactions(transaction).forEach((t) => {
        acc.set(t.id, index++)
      })
      acc.set(transaction.id, index++)
      return acc
    }
  }, new Map<string, number>())
}

const getTableColumns = ({
  transactionPositions,
  nonDeletableTransactionIds,
  onEditTransaction,
  onEditResources,
  onDelete,
}: {
  transactionPositions: TransactionPositionsInGroup
  nonDeletableTransactionIds: string[]
  onEditTransaction: (transaction: BuildTransactionResult | PlaceholderTransaction | FulfilledByTransaction) => Promise<void>
  onEditResources: (transaction: BuildAppCallTransactionResult | BuildMethodCallTransactionResult) => Promise<void>
  onDelete: (transaction: BuildTransactionResult) => void
}): ColumnDef<BuildTransactionResult>[] => [
  {
    id: 'position',
    cell: (c) => {
      const transaction = c.row.original
      return transactionPositions.get(transaction.id)!
    },
  },
  {
    header: 'Type',
    accessorFn: (item) => asTransactionLabelFromBuildableTransactionType(item.type),
    meta: { className: 'w-40' },
  },
  {
    header: 'Description',
    cell: (c) => {
      const transaction = c.row.original
      return (
        <DescriptionList
          items={asDescriptionListItems(transaction, transactionPositions, onEditTransaction)}
          dtClassName="w-[9.5rem] truncate"
        />
      )
    },
  },
  {
    id: 'actions',
    meta: { className: 'w-14' },
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger aria-label={transactionActionsLabel} asChild>
          <Button variant="outline" size="sm" className="px-2.5" icon={<EllipsisVertical size={16} />} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="right">
          <DropdownMenuItem onClick={() => onEditTransaction(row.original)}>Edit</DropdownMenuItem>
          {(row.original.type === BuildableTransactionType.AppCall || row.original.type === BuildableTransactionType.MethodCall) && (
            <DropdownMenuItem
              onClick={() => onEditResources(row.original as BuildAppCallTransactionResult | BuildMethodCallTransactionResult)}
            >
              Edit Resources
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => onDelete(row.original)} disabled={nonDeletableTransactionIds.includes(row.original.id)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

const getSubTransactions = (transaction: BuildTransactionResult): (BuildTransactionResult | PlaceholderTransaction)[] => {
  if (transaction.type !== BuildableTransactionType.MethodCall) {
    return []
  }
  if (!transaction.methodArgs) {
    return []
  }
  return transaction.methodArgs.reduce(
    (acc, arg) => {
      if (isBuildTransactionResult(arg)) {
        acc.push(...[...getSubTransactions(arg), arg])
      }
      if (typeof arg === 'object' && 'type' in arg && arg.type === BuildableTransactionType.Placeholder) {
        acc.push(arg)
      }
      return acc
    },
    [] as (BuildTransactionResult | PlaceholderTransaction)[]
  )
}

const getSubTransactionsTableColumns = ({
  transactionPositions,
  onEditTransaction,
  onEditResources,
}: {
  transactionPositions: TransactionPositionsInGroup
  onEditTransaction: (transaction: BuildTransactionResult | PlaceholderTransaction) => Promise<void>
  onEditResources: (transaction: BuildAppCallTransactionResult | BuildMethodCallTransactionResult) => Promise<void>
}): ColumnDef<BuildTransactionResult | PlaceholderTransaction>[] => [
  {
    id: 'empty',
    meta: { className: 'w-10' },
  },
  {
    id: 'position',
    cell: (c) => {
      const transaction = c.row.original
      return transactionPositions.get(transaction.id)!
    },
  },
  {
    header: 'Type',
    accessorFn: (item) =>
      item.type === BuildableTransactionType.Placeholder
        ? asTransactionLabelFromTransactionType(item.targetType)
        : asTransactionLabelFromBuildableTransactionType(item.type),
    meta: { className: 'w-40' },
  },
  {
    header: 'Description',
    cell: (c) => {
      const transaction = c.row.original
      return (
        <div>
          {transaction.type === BuildableTransactionType.Placeholder ? (
            <div className="flex min-h-8 items-center gap-1.5">
              <PlusCircle size={16} />
              {transaction.type === BuildableTransactionType.Placeholder && <span>Build the transaction passed in as an argument</span>}
            </div>
          ) : (
            <DescriptionList
              items={asDescriptionListItems(transaction, transactionPositions, onEditTransaction)}
              dtClassName="w-[9.5rem] truncate"
            />
          )}
          <div className="absolute -bottom-2 right-1/2 z-10">
            <Link2Icon size={16} className="text-muted-foreground/70" />
          </div>
        </div>
      )
    },
  },
  {
    id: 'actions',
    meta: { className: 'w-14' },
    cell: ({ row }) =>
      row.original.type !== BuildableTransactionType.Placeholder ? (
        <DropdownMenu>
          <DropdownMenuTrigger aria-label={transactionActionsLabel} asChild>
            <Button variant="outline" size="sm" className="px-2.5" icon={<EllipsisVertical size={16} />} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="right">
            <DropdownMenuItem onClick={() => onEditTransaction(row.original)}>Edit</DropdownMenuItem>
            {row.original.type === BuildableTransactionType.AppCall ||
              (row.original.type === BuildableTransactionType.MethodCall && (
                <DropdownMenuItem
                  onClick={() => onEditResources(row.original as BuildAppCallTransactionResult | BuildMethodCallTransactionResult)}
                >
                  Edit Resources
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : undefined,
  },
]
function SubTransactionsRows({
  transaction,
  transactionPositions,
  onEditTransaction,
  onEditResources,
}: {
  transaction: BuildTransactionResult
  transactionPositions: TransactionPositionsInGroup
  onEditTransaction: (transaction: BuildTransactionResult | PlaceholderTransaction) => Promise<void>
  onEditResources: (transaction: BuildAppCallTransactionResult | BuildMethodCallTransactionResult) => Promise<void>
}) {
  const subTransactions = useMemo(() => {
    return getSubTransactions(transaction)
  }, [transaction])

  const table = useReactTable({
    data: subTransactions,
    columns: getSubTransactionsTableColumns({ transactionPositions, onEditTransaction, onEditResources }),
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      {table.getRowModel().rows.map((row) => (
        <TableRow
          key={row.id}
          data-state={row.getIsSelected() && 'selected'}
          className={cn(
            'relative',
            row.original.type === BuildableTransactionType.Placeholder && 'cursor-pointer bg-muted/50 text-primary'
          )}
          {...(row.original.type === BuildableTransactionType.Placeholder ? { onClick: () => onEditTransaction(row.original) } : undefined)}
        >
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id} className={cn(cell.column.columnDef.meta?.className, 'border-b')}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}
