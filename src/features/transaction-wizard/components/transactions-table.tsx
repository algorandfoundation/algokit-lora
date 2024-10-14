import { ColumnDef, flexRender, getCoreRowModel, Row, RowModel, useReactTable } from '@tanstack/react-table'
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
  TransactionFamily,
} from '../models'
import { DescriptionList } from '@/features/common/components/description-list'
import { asDescriptionListItems, asTransactionLabelFromBuildableTransactionType, asTransactionLabelFromTransactionType } from '../mappers'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/features/common/components/dropdown-menu'
import { isBuildTransactionResult, isPlaceholderTransaction } from '../utils/is-build-transaction-result'
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

function TransactionsFamily({
  rowModel,
  family,
  transactionPositions,
  onEditTransaction,
  onEditResources,
}: {
  rowModel: RowModel<PlaceholderTransaction | BuildTransactionResult>
  family: TransactionFamily
  transactionPositions: TransactionPositionsInGroup
  onEditTransaction: (transaction: BuildTransactionResult | PlaceholderTransaction) => Promise<void>
  onEditResources: (transaction: BuildAppCallTransactionResult | BuildMethodCallTransactionResult) => Promise<void>
}) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: family.id,
  })

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform), //let dnd-kit do its thing
    transition: transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1 : 0,
    position: 'relative',
  }

  const familyMemberRows = useMemo(
    () => family.transactions.slice(0, -1).map((t) => rowModel.rowsById[t.id]!),
    [family.transactions, rowModel]
  )
  const familyLeaderRow = useMemo(() => rowModel.rowsById[family.id]!, [family.id, rowModel])

  return (
    <TableBody ref={setNodeRef} style={style}>
      {familyMemberRows.map((row) => (
        <TableRow
          className={cn('relative', isPlaceholderTransaction(row.original) && 'cursor-pointer bg-muted/50 text-primary')}
          {...(isPlaceholderTransaction(row.original) ? { onClick: () => onEditTransaction(row.original) } : undefined)}
        >
          <TableCell></TableCell>
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id} className={cn(cell.column.columnDef.meta?.className, 'border-b')}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      ))}
      <TableRow>
        <TableCell className="w-10 border-b">
          <RowDragHandleCell rowId={familyLeaderRow.id} />
        </TableCell>
        {familyLeaderRow.getVisibleCells().map((cell) => (
          <TableCell key={cell.id} className={cn(cell.column.columnDef.meta?.className, 'border-b')}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    </TableBody>
  )
}

type Props = {
  families: TransactionFamily[]
  setFamilies: (data: TransactionFamily[]) => void
  ariaLabel?: string
  onEditTransaction: (transaction: BuildTransactionResult | PlaceholderTransaction) => Promise<void>
  onEditResources: (transaction: BuildAppCallTransactionResult | BuildMethodCallTransactionResult) => Promise<void>
  onDelete: (transaction: BuildTransactionResult) => void
  nonDeletableTransactionIds: string[]
}

export function TransactionsTable({
  families,
  setFamilies,
  ariaLabel,
  onEditTransaction,
  onEditResources,
  onDelete,
  nonDeletableTransactionIds,
}: Props) {
  const transactions = useMemo(() => families.flatMap((family) => family.transactions), [families])
  const transactionPositions = useMemo(() => calculatePositions(transactions), [transactions])

  const columns = getTableColumns({ onEditTransaction, onEditResources, onDelete, nonDeletableTransactionIds, transactionPositions })

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  })

  const dataIds = useMemo<string[]>(() => families.map((d) => d.id), [families])

  // reorder rows after drag & drop
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      const oldIndex = dataIds.indexOf(active.id.toString())
      const newIndex = dataIds.indexOf(over.id.toString())
      const newData = arrayMove(families, oldIndex, newIndex) //this is just a splice util
      setFamilies(newData)
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
            {families.length ? (
              families.map((family) => (
                <TransactionsFamily
                  rowModel={table.getRowModel()}
                  key={family.id}
                  family={family}
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

const calculatePositions = (transactions: (PlaceholderTransaction | BuildTransactionResult)[]): TransactionPositionsInGroup => {
  let index = 1
  return transactions.reduce((acc, transaction) => {
    acc.set(transaction.id, index++)
    return acc
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
  onEditTransaction: (transaction: BuildTransactionResult | PlaceholderTransaction) => Promise<void>
  onEditResources: (transaction: BuildAppCallTransactionResult | BuildMethodCallTransactionResult) => Promise<void>
  onDelete: (transaction: BuildTransactionResult) => void
}): ColumnDef<PlaceholderTransaction | BuildTransactionResult>[] => [
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
      isPlaceholderTransaction(item)
        ? asTransactionLabelFromTransactionType(item.targetType)
        : asTransactionLabelFromBuildableTransactionType(item.type),
    meta: { className: 'w-40' },
  },
  {
    header: 'Description',
    cell: (c) => {
      const transaction = c.row.original
      const isMethodCallArg = isPlaceholderTransaction(transaction) || transaction.argumentForMethodCalls?.length

      return (
        <div>
          {isPlaceholderTransaction(transaction) ? (
            <div className="flex min-h-8 items-center gap-1.5">
              <PlusCircle size={16} />
              <span>Build argument for transaction {transactionPositions.get(transaction.argumentForMethodCall)}</span>
            </div>
          ) : (
            <DescriptionList
              items={asDescriptionListItems(transaction, transactionPositions, onEditTransaction)}
              dtClassName="w-[9.5rem] truncate"
            />
          )}
          {isMethodCallArg && (
            <div className="absolute -bottom-2 right-1/2">
              <Link2Icon size={16} className="text-muted-foreground/70" />
            </div>
          )}
        </div>
      )
    },
  },
  {
    id: 'actions',
    meta: { className: 'w-14' },
    cell: ({ row }) =>
      !isPlaceholderTransaction(row.original) ? (
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
            <DropdownMenuItem
              onClick={() => onDelete(row.original as BuildTransactionResult)}
              disabled={nonDeletableTransactionIds.includes(row.original.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : undefined,
  },
]

// const getSubTransactions = (transaction: BuildTransactionResult): (BuildTransactionResult | PlaceholderTransaction)[] => {
//   if (transaction.type !== BuildableTransactionType.MethodCall) {
//     return []
//   }
//   if (!transaction.methodArgs) {
//     return []
//   }
//   return transaction.methodArgs.reduce(
//     (acc, arg) => {
//       if (isBuildTransactionResult(arg)) {
//         acc.push(...[...getSubTransactions(arg), arg])
//       }
//       if (isPlaceholderTransaction(arg)) {
//         acc.push(arg)
//       }
//       return acc
//     },
//     [] as (BuildTransactionResult | PlaceholderTransaction)[]
//   )
// }

// const getSubTransactionsTableColumns = ({
//   transactionPositions,
//   onEditTransaction,
//   onEditResources,
// }: {
//   transactionPositions: TransactionPositionsInGroup
//   onEditTransaction: (transaction: BuildTransactionResult | PlaceholderTransaction) => Promise<void>
//   onEditResources: (transaction: BuildAppCallTransactionResult | BuildMethodCallTransactionResult) => Promise<void>
// }): ColumnDef<BuildTransactionResult | PlaceholderTransaction>[] => [
//   {
//     id: 'empty',
//     meta: { className: 'w-10' },
//   },
//   {
//     id: 'position',
//     cell: (c) => {
//       const transaction = c.row.original
//       return transactionPositions.get(transaction.id)!
//     },
//   },
//   {
//     header: 'Type',
//     accessorFn: (item) =>
//       isPlaceholderTransaction(item)
//         ? asTransactionLabelFromTransactionType(item.targetType)
//         : asTransactionLabelFromBuildableTransactionType(item.type),
//     meta: { className: 'w-40' },
//   },
//   {
//     header: 'Description',
//     cell: (c) => {
//       const transaction = c.row.original
//       return (
//         <div>
//           {isPlaceholderTransaction(transaction) ? (
//             <div className="flex min-h-8 items-center gap-1.5">
//               <PlusCircle size={16} />
//               <span>Build argument for transaction {transactionPositions.get(transaction.argumentForMethodCall)}</span>
//             </div>
//           ) : (
//             <DescriptionList
//               items={asDescriptionListItems(transaction, transactionPositions, onEditTransaction)}
//               dtClassName="w-[9.5rem] truncate"
//             />
//           )}
//           <div className="absolute -bottom-2 right-1/2">
//             <Link2Icon size={16} className="text-muted-foreground/70" />
//           </div>
//         </div>
//       )
//     },
//   },
//   {
//     id: 'actions',
//     meta: { className: 'w-14' },
//     cell: ({ row }) =>
//       !isPlaceholderTransaction(row.original) ? (
//         <DropdownMenu>
//           <DropdownMenuTrigger aria-label={transactionActionsLabel} asChild>
//             <Button variant="outline" size="sm" className="px-2.5" icon={<EllipsisVertical size={16} />} />
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align="start" side="right">
//             <DropdownMenuItem onClick={() => onEditTransaction(row.original)}>Edit</DropdownMenuItem>
//             {row.original.type === BuildableTransactionType.AppCall ||
//               (row.original.type === BuildableTransactionType.MethodCall && (
//                 <DropdownMenuItem
//                   onClick={() => onEditResources(row.original as BuildAppCallTransactionResult | BuildMethodCallTransactionResult)}
//                 >
//                   Edit Resources
//                 </DropdownMenuItem>
//               ))}
//           </DropdownMenuContent>
//         </DropdownMenu>
//       ) : undefined,
//   },
// ]
// function SubTransactionsRows({
//   transaction,
//   transactionPositions,
//   onEditTransaction,
//   onEditResources,
// }: {
//   transaction: BuildTransactionResult
//   transactionPositions: TransactionPositionsInGroup
//   onEditTransaction: (transaction: BuildTransactionResult | PlaceholderTransaction) => Promise<void>
//   onEditResources: (transaction: BuildAppCallTransactionResult | BuildMethodCallTransactionResult) => Promise<void>
// }) {
//   const subTransactions = useMemo(() => {
//     return getSubTransactions(transaction)
//   }, [transaction])
//
//   const table = useReactTable({
//     data: subTransactions,
//     columns: getSubTransactionsTableColumns({ transactionPositions, onEditTransaction, onEditResources }),
//     getCoreRowModel: getCoreRowModel(),
//   })
//
//   return (
//     <>
//       {table.getRowModel().rows.map((row) => (
//         <TableRow
//           key={row.id}
//           data-state={row.getIsSelected() && 'selected'}
//           className={cn('relative', isPlaceholderTransaction(row.original) && 'cursor-pointer bg-muted/50 text-primary')}
//           {...(isPlaceholderTransaction(row.original) ? { onClick: () => onEditTransaction(row.original) } : undefined)}
//         >
//           {row.getVisibleCells().map((cell) => (
//             <TableCell key={cell.id} className={cn(cell.column.columnDef.meta?.className, 'border-b')}>
//               {flexRender(cell.column.columnDef.cell, cell.getContext())}
//             </TableCell>
//           ))}
//         </TableRow>
//       ))}
//     </>
//   )
// }
