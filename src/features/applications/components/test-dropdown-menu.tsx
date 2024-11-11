import { Button } from '@/features/common/components/button'
import { DataTable } from '@/features/common/components/data-table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/features/common/components/dropdown-menu'
import { DialogBodyProps, useDialogForm } from '@/features/common/hooks/use-dialog-form'
import { transactionActionsLabel, transactionGroupTableLabel } from '@/features/transaction-wizard/components/labels'
import { ColumnDef, flexRender, getCoreRowModel, Row, useReactTable } from '@tanstack/react-table'
import { CSSProperties, useCallback, useMemo, useState } from 'react'
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/features/common/components/table'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { RowDragHandleCell } from '@/features/transaction-wizard/components/transactions-table'
import { CSS } from '@dnd-kit/utilities'

export function TestDropDownMenu() {
  const [data, setData] = useState<{ id: number }[]>([])

  const { open, dialog } = useDialogForm({
    dialogHeader: 'Hello dialog',
    dialogBody: (props: DialogBodyProps<void, void>) => (
      <div>
        Hello
        <Button onClick={() => props.onSubmit()}>Close</Button>
      </div>
    ),
  })

  const openDialog = useCallback(async () => {
    await open()
    setData([{ id: 1 }])
  }, [open])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id.toString(),
  })

  const dataIds = useMemo<string[]>(() => data.map((d) => d.id.toString()), [data])

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
    <>
      <Button onClick={openDialog}>Open</Button>
      {/* <DataTable ariaLabel={transactionGroupTableLabel} columns={columns} data={data}></DataTable> */}
      <DndContext collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} onDragEnd={handleDragEnd} sensors={sensors}>
        <div className="grid">
          <Table aria-label={transactionGroupTableLabel} className="border-separate border-spacing-0 overflow-hidden">
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
                table.getRowModel().rows.map((row) => <DataRow key={row.id} row={row} />)
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
      {dialog}
    </>
  )
}

const columns: ColumnDef<{ id: number }>[] = [
  {
    id: 'index',
    cell: (c) => {
      return c.row.original.id
    },
  },
  {
    id: 'actions',
    cell: () => {
      return (
        <DropdownMenu
          onOpenChange={() => {
            console.log('here!!')
          }}
        >
          <DropdownMenuTrigger aria-label={transactionActionsLabel} asChild>
            <Button />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="right">
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
            <DropdownMenuItem>Item 3</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

function DataRow({ row }: { row: Row<{ id: number }> }) {
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
      <TableRow data-state={row.getIsSelected() && 'selected'}>
        <TableCell className="w-10 border-b">
          <RowDragHandleCell rowId={row.id} />
        </TableCell>
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
        ))}
      </TableRow>
    </TableBody>
  )
}
