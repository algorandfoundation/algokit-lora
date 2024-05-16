import { LazyLoadDataTable } from '@/features/common/components/lazy-load-data-table'
import { useFetchNextApplicationBoxPage } from '../data/application-boxes'
import { ApplicationId } from '../data/types'
import { ColumnDef } from '@tanstack/react-table'
import { modelsv2 } from 'algosdk'

type Props = {
  applicationId: ApplicationId
}

export function ApplicationBoxes({ applicationId }: Props) {
  const fetchNextPage = useFetchNextApplicationBoxPage(applicationId)

  return <LazyLoadDataTable columns={tableColumns} fetchNextPage={fetchNextPage} />
}

const tableColumns: ColumnDef<modelsv2.BoxDescriptor>[] = [
  {
    header: 'Round',
    accessorKey: 'name',
  },
]
