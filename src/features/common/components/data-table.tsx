import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getExpandedRowModel,
  ExpandedState,
  Row,
} from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/features/common/components/table'
import { DataTablePagination } from './data-table-pagination'
import { CSSProperties, useEffect, useMemo, useState } from 'react'
import { cn } from '@/features/common/utils'
// needed for table body level scope DnD setup
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

// needed for row & cell level scope DnD setup
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Cell Component
export const RowDragHandleCell = ({ rowId }: { rowId: string }) => {
  const { attributes, listeners } = useSortable({
    id: rowId,
  })
  return (
    // Alternatively, you could set these attributes on the rows themselves
    <button {...attributes} {...listeners}>
      🟰
    </button>
  )
}

// Row Component
function DraggableRow<TData>({ row, getId }: { row: Row<TData>; getId?: (data: TData) => string }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: getId ? getId(row.original) : row.id,
  })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform), //let dnd-kit do its thing
    transition: transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1 : 0,
    position: 'relative',
  }
  return (
    // connect row ref to dnd-kit, apply important styles
    <TableRow
      data-state={row.getIsSelected() && 'selected'}
      {...(row.getCanExpand() ? { className: 'cursor-pointer', onClick: row.getToggleExpandedHandler() } : {})}
      ref={setNodeRef}
      style={style}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} className={cn(cell.column.columnDef.meta?.className)}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  setData?: (data: TData[]) => void
  getSubRows?: (row: TData) => TData[]
  subRowsExpanded?: boolean
  ariaLabel?: string
  sortable?: false
  getId?: (data: TData) => string
}

interface SortableDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  setData: (data: TData[]) => void
  getSubRows?: (row: TData) => TData[]
  subRowsExpanded?: boolean
  ariaLabel?: string
  sortable: true
  getId(data: TData): string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  setData,
  getSubRows,
  subRowsExpanded,
  ariaLabel,
  sortable,
  getId,
}: DataTableProps<TData, TValue> | SortableDataTableProps<TData, TValue>) {
  const [expanded, setExpanded] = useState<ExpandedState>({})

  const table = useReactTable({
    data,
    paginateExpandedRows: false,
    state: {
      expanded: expanded,
    },
    onExpandedChange: setExpanded,
    getSubRows: getSubRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: getId,
  })

  useEffect(() => {
    table.toggleAllRowsExpanded(subRowsExpanded ?? false)
  }, [subRowsExpanded, table])

  const dataIds = useMemo<UniqueIdentifier[]>(() => (!sortable ? [] : data?.map((d) => getId(d))), [data, getId, sortable])

  // reorder rows after drag & drop
  function handleDragEnd(event: DragEndEvent) {
    if (!sortable) return

    const { active, over } = event
    if (active && over && active.id !== over.id) {
      const oldIndex = dataIds.indexOf(active.id)
      const newIndex = dataIds.indexOf(over.id)
      const newData = arrayMove(data, oldIndex, newIndex) //this is just a splice util
      setData(newData)
    }
  }

  const sensors = useSensors(useSensor(MouseSensor, {}), useSensor(TouchSensor, {}), useSensor(KeyboardSensor, {}))

  return (
    <DndContext collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} onDragEnd={handleDragEnd} sensors={sensors}>
      <div className="grid">
        <Table className="border-b" aria-label={ariaLabel}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-t bg-muted/50">
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
          <TableBody>
            <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => <DraggableRow key={row.id} row={row} getId={getId} />)
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </SortableContext>
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </DndContext>
  )
}
