import SvgChevronLeft from '@/features/common/components/icons/chevron-left'
import SvgChevronRight from '@/features/common/components/icons/chevron-right'

import { Table } from '@tanstack/react-table'

import { Button } from '@/features/common/components/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/features/common/components/select'
import SvgChevronLeftLine from './icons/chevron-left-line'
import SvgChevronRightLine from './icons/chevron-right-line'

interface DataTablePaginationProps<TData> {
  table: Table<TData>
}

const pageSizeOptions = [10, 20, 30, 40, 50]

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  return (
    <div className="mt-2 flex items-center justify-between">
      <div className="flex w-full">
        <div className="flex shrink grow basis-0 items-center justify-start space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
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
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
        </div>
        <div className="flex shrink grow basis-0 items-center justify-end space-x-2">
          <Button
            variant="outline"
            className="hidden size-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <SvgChevronLeftLine className="size-4" />
          </Button>
          <Button variant="outline" className="size-8 p-0" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <span className="sr-only">Go to previous page</span>
            <SvgChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" className="size-8 p-0" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <span className="sr-only">Go to next page</span>
            <SvgChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden size-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <SvgChevronRightLine className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
