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
import { BuildableTransactionType, BuildTransactionResult } from '../models'
import { DescriptionList } from '@/features/common/components/description-list'
import { asDescriptionListItems } from '../mappers'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/features/common/components/dropdown-menu'

export const RowDragHandleCell = ({ rowId }: { rowId: string }) => {
  const { attributes, listeners } = useSortable({
    id: rowId,
  })
  return (
    <button {...attributes} {...listeners}>
      <GripVertical size={16} />
    </button>
  )
}

function TransactionRow({ row }: { row: Row<BuildTransactionResult> }) {
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

  const subTransactionsTable = renderSubTransactions(row.original)
  return (
    <TableBody ref={setNodeRef} style={style} className="border-y">
      {subTransactionsTable && (
        <TableRow data-state={row.getIsSelected() && 'selected'}>
          <TableCell></TableCell>
          <TableCell colSpan={2}>{subTransactionsTable}</TableCell>
        </TableRow>
      )}
      <TableRow data-state={row.getIsSelected() && 'selected'}>
        <TableCell>
          <RowDragHandleCell rowId={row.id} />
        </TableCell>
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id} className={cn(cell.column.columnDef.meta?.className)}>
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
  onEdit: (transaction: BuildTransactionResult) => Promise<void>
  onDelete: (transaction: BuildTransactionResult) => void
  nonDeletableTransactionIds: string[]
}

export function TransactionsTable({ data, setData, ariaLabel, onEdit, onDelete, nonDeletableTransactionIds }: Props) {
  const columns = getTableColumns({ onEdit, onDelete, nonDeletableTransactionIds })
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
        <Table aria-label={ariaLabel}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-t bg-muted/50">
                <TableHead className="w-10"></TableHead>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className={cn(header.column.columnDef.meta?.className)}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => <TransactionRow key={row.id} row={row} />)
            ) : (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
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
  onDelete,
}: {
  nonDeletableTransactionIds: string[]
  onEdit: (transaction: BuildTransactionResult) => Promise<void>
  onDelete: (transaction: BuildTransactionResult) => void
}): ColumnDef<BuildTransactionResult>[] => [
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
  {
    id: 'actions',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <EllipsisVertical size={16} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="right">
          <DropdownMenuItem className="justify-center" onClick={() => onEdit(row.original)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="justify-center"
            onClick={() => onDelete(row.original)}
            disabled={nonDeletableTransactionIds.includes(row.original.id)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

const renderSubTransactions = (transaction: BuildTransactionResult): React.ReactNode => {
  if (transaction.type !== BuildableTransactionType.AppCall) {
    return undefined
  }
  const subTransactions = transaction.methodArgs?.filter((arg): arg is BuildTransactionResult => typeof arg === 'object') ?? []
  if (subTransactions.length === 0) {
    return undefined
  }

  return <SubTransactionsTable subTransactions={subTransactions} />
}

const subTransactionsTableColumns: ColumnDef<BuildTransactionResult>[] = [
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
function SubTransactionsTable({ subTransactions }: { subTransactions: BuildTransactionResult[] }) {
  const table = useReactTable({
    data: subTransactions,
    columns: subTransactionsTableColumns,
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
