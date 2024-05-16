import SvgChevronLeft from '@/features/common/components/icons/chevron-left'
import SvgChevronRight from '@/features/common/components/icons/chevron-right'
import { Button } from '@/features/common/components/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/features/common/components/select'

interface Props {
  pageSize: number
  setPageSize: (pageSize: number) => void
  currentPage: number
  nextPageEnabled: boolean
  nextPage: () => void
  previousPageEnabled: boolean
  previousPage: () => void
}

const pageSizeOptions = [10, 20, 30, 40, 50]

export function LazyLoadDataTablePagination({
  pageSize,
  setPageSize,
  currentPage,
  nextPageEnabled,
  nextPage,
  previousPageEnabled,
  previousPage,
}: Props) {
  return (
    <div className="mt-2 flex items-center justify-between">
      <div className="flex w-full">
        <div className="flex shrink grow basis-0 items-center justify-start space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
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
        <div className="flex shrink grow basis-0 items-center justify-center text-sm font-medium">Page {currentPage}</div>
        <div className="flex shrink grow basis-0 items-center justify-end space-x-2">
          <Button variant="outline" className="size-8 p-0" onClick={() => previousPage()} disabled={!previousPageEnabled}>
            <span className="sr-only">Go to previous page</span>
            <SvgChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" className="size-8 p-0" onClick={() => nextPage()} disabled={!nextPageEnabled}>
            <span className="sr-only">Go to next page</span>
            <SvgChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
