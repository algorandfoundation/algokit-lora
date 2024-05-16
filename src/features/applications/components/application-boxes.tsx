import { LazyLoadDataTable } from '@/features/common/components/lazy-load-data-table'
import { useFetchNextApplicationBoxPage } from '../data/application-boxes'
import { ApplicationId } from '../data/types'
import { ColumnDef } from '@tanstack/react-table'
import { modelsv2 } from 'algosdk'
import { Buffer } from 'buffer'

type Props = {
  applicationId: ApplicationId
}

export function ApplicationBoxes({ applicationId }: Props) {
  const fetchNextPage = useFetchNextApplicationBoxPage(applicationId)

  return <LazyLoadDataTable columns={tableColumns} fetchNextPage={fetchNextPage} />
}

const tableColumns: ColumnDef<modelsv2.BoxDescriptor>[] = [
  {
    header: 'Name',
    accessorKey: 'name',
    cell: (context) => {
      const value = context.getValue<Uint8Array>()
      return Buffer.from(value).toString('base64')
    },
  },
]
