import { ColumnDef, flexRender, getCoreRowModel, useReactTable, Row } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/features/common/components/table'
import { CSSProperties, useMemo } from 'react'
import { cn } from '@/features/common/utils'
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { EllipsisVertical, GripVertical } from 'lucide-react'
import {
  BuildableTransactionType,
  BuildAppCallTransactionResult,
  BuildMethodCallTransactionResult,
  BuildTransactionResult,
  PlaceholderTransaction,
} from '../models'
import { DescriptionList } from '@/features/common/components/description-list'
import { asDescriptionListItems, asTransactionLabel } from '../mappers'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/features/common/components/dropdown-menu'
import { isBuildTransactionResult } from '../utils/is-build-transaction-result'
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
  onEdit,
  onEditResources,
}: {
  row: Row<BuildTransactionResult>
  onEdit: (transaction: BuildTransactionResult | PlaceholderTransaction) => Promise<void>
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

  const subTransactionsRows = renderSubTransactions(row.original, onEdit, onEditResources)
  return (
    <TableBody ref={setNodeRef} style={style}>
      {subTransactionsRows}
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
  onEdit: (transaction: BuildTransactionResult | PlaceholderTransaction) => Promise<void>
  onEditResources: (transaction: BuildAppCallTransactionResult | BuildMethodCallTransactionResult) => Promise<void>
  onDelete: (transaction: BuildTransactionResult) => void
  nonDeletableTransactionIds: string[]
}

export function TransactionsTable({ data, setData, ariaLabel, onEdit, onEditResources, onDelete, nonDeletableTransactionIds }: Props) {
  const columns = getTableColumns({ onEdit, onEditResources, onDelete, nonDeletableTransactionIds })
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
                    <TableHead key={header.id} className={cn(header.column.columnDef.meta?.className, 'border-y')}>
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
                .rows.map((row) => <TransactionRow key={row.id} row={row} onEdit={onEdit} onEditResources={onEditResources} />)
            ) : (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
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

const getTableColumns = ({
  nonDeletableTransactionIds,
  onEdit,
  onEditResources,
  onDelete,
}: {
  nonDeletableTransactionIds: string[]
  onEdit: (transaction: BuildTransactionResult | PlaceholderTransaction) => Promise<void>
  onEditResources: (transaction: BuildAppCallTransactionResult | BuildMethodCallTransactionResult) => Promise<void>
  onDelete: (transaction: BuildTransactionResult) => void
}): ColumnDef<BuildTransactionResult>[] => [
  {
    header: 'Type',
    accessorFn: (item) => asTransactionLabel(item.type),
    meta: { className: 'w-40' },
  },
  {
    header: 'Description',
    cell: (c) => {
      const transaction = c.row.original
      return <DescriptionList items={asDescriptionListItems(transaction, onEdit)} dtClassName="w-[9.5rem] truncate" />
    },
  },
  {
    id: 'actions',
    meta: { className: 'w-10' },
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger className="flex w-full items-center justify-center py-4" aria-label={transactionActionsLabel}>
          <EllipsisVertical size={16} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="right">
          <DropdownMenuItem onClick={() => onEdit(row.original)}>Edit</DropdownMenuItem>
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

const renderSubTransactions = (
  transaction: BuildTransactionResult,
  onEdit: (transaction: BuildTransactionResult | PlaceholderTransaction) => Promise<void>,
  onEditResources: (transaction: BuildAppCallTransactionResult | BuildMethodCallTransactionResult) => Promise<void>
): React.ReactNode => {
  if (transaction.type !== BuildableTransactionType.MethodCall) {
    return undefined
  }
  const subTransactions = getSubTransactions(transaction)
  if (subTransactions.length === 0) {
    return undefined
  }

  return <SubTransactionsRows subTransactions={subTransactions} onEdit={onEdit} onEditResources={onEditResources} />
}

const getSubTransactionsTableColumns = ({
  onEdit,
  onEditResources,
}: {
  onEdit: (transaction: BuildTransactionResult | PlaceholderTransaction) => Promise<void>
  onEditResources: (transaction: BuildAppCallTransactionResult | BuildMethodCallTransactionResult) => Promise<void>
}): ColumnDef<BuildTransactionResult | PlaceholderTransaction>[] => [
  {
    id: 'empty',
    meta: { className: 'w-10' },
  },
  {
    header: 'Type',
    accessorFn: (item) => (item.type === BuildableTransactionType.Placeholder ? item.targetType : asTransactionLabel(item.type)),
    meta: { className: 'w-40' },
  },
  {
    header: 'Description',
    cell: (c) => {
      const transaction = c.row.original
      return transaction.type === BuildableTransactionType.Placeholder ? (
        <div>
          <span>Argument for method {transaction.argForMethod}</span>
          <Button variant="link" className="ml-2" onClick={() => onEdit(transaction)}>
            Create
          </Button>
        </div>
      ) : (
        <DescriptionList items={asDescriptionListItems(transaction, onEdit)} dtClassName="w-[9.5rem] truncate" />
      )
    },
  },
  {
    id: 'actions',
    meta: { className: 'w-10' },
    cell: ({ row }) =>
      row.original.type !== BuildableTransactionType.Placeholder ? (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center justify-center py-4">
            <EllipsisVertical size={16} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="right">
            <DropdownMenuItem onClick={() => onEdit(row.original)}>Edit</DropdownMenuItem>
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
  subTransactions,
  onEdit,
  onEditResources,
}: {
  subTransactions: (BuildTransactionResult | PlaceholderTransaction)[]
  onEdit: (transaction: BuildTransactionResult | PlaceholderTransaction) => Promise<void>
  onEditResources: (transaction: BuildAppCallTransactionResult | BuildMethodCallTransactionResult) => Promise<void>
}) {
  const table = useReactTable({
    data: subTransactions,
    columns: getSubTransactionsTableColumns({ onEdit, onEditResources }),
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      {table.getRowModel().rows.map((row) => (
        <TableRow
          key={row.id}
          data-state={row.getIsSelected() && 'selected'}
          {...(row.getCanExpand() ? { className: 'cursor-pointer', onClick: row.getToggleExpandedHandler() } : {})}
        >
          {row.getVisibleCells().map((cell) => (
            <TableCell
              key={cell.id}
              className={cn(
                cell.column.columnDef.meta?.className,
                'border-b',
                row.original.type === BuildableTransactionType.Placeholder ? 'bg-muted-foreground/70' : ''
              )}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}
