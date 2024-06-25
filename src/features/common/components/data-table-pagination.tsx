import { Table } from '@tanstack/react-table'
import { Button } from '@/features/common/components/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/features/common/components/select'
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from 'lucide-react'

interface DataTablePaginationProps<TData> {
  table: Table<TData>
}

const pageSizeOptions = [10, 20, 30, 40, 50]

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  return (
    <div className="mt-2 flex items-center justify-between">
      <div className="flex w-full">
        <div className="flex shrink grow basis-0 items-center justify-start gap-2">
          <p className="hidden text-sm font-medium md:flex">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex shrink grow basis-0 items-center justify-center text-sm font-medium">
          <span className="hidden md:flex">Page&nbsp;</span>
          {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
        </div>
        <div className="flex shrink grow basis-0 items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronFirst />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Button>
          <Button variant="outline" size="icon" className="size-8 p-0" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronLast />
          </Button>
        </div>
      </div>
    </div>
  )
}
