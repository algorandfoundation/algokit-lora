import { LazyLoadDataTable } from '@/features/common/components/lazy-load-data-table'
import { useFetchNextApplicationBoxPage } from '../data/application-boxes'
import { ApplicationId } from '../data/types'
import { ColumnDef } from '@tanstack/react-table'
import { ApplicationBoxSummary } from '../models'
import { ApplicationBoxLink } from './application-box-link'
import { useMemo } from 'react'

type Props = {
  applicationId: ApplicationId
}

export function ApplicationBoxes({ applicationId }: Props) {
  const fetchNextPage = useFetchNextApplicationBoxPage(applicationId)
  const tableColumns = useMemo(() => createTableColumns(applicationId), [applicationId])

  return <LazyLoadDataTable columns={tableColumns} fetchNextPage={fetchNextPage} />
}

const createTableColumns = (applicationId: ApplicationId): ColumnDef<ApplicationBoxSummary>[] => [
  {
    header: 'Name',
    accessorKey: 'name',
    cell: (context) => <ApplicationBoxLink applicationId={applicationId} boxName={context.getValue<string>()} />,
  },
]
