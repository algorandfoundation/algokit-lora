import { LazyLoadDataTable } from '@/features/common/components/lazy-load-data-table'
import { createLoadableApplicationBoxPage } from '../data/application-boxes'
import { ApplicationId } from '../data/types'
import { ColumnDef } from '@tanstack/react-table'
import { ApplicationBoxSummary } from '../models'
import { useMemo } from 'react'
import { ApplicationBoxDetailsDialog } from './application-box-details-dialog'

type Props = {
  applicationId: ApplicationId
}

export function ApplicationBoxes({ applicationId }: Props) {
  const createLoadblePage = useMemo(() => createLoadableApplicationBoxPage(applicationId), [applicationId])
  const tableColumns = useMemo(() => createTableColumns(applicationId), [applicationId])

  return <LazyLoadDataTable columns={tableColumns} createLoadablePage={createLoadblePage} />
}

const createTableColumns = (applicationId: ApplicationId): ColumnDef<ApplicationBoxSummary>[] => [
  {
    header: 'Name',
    accessorKey: 'name',
    cell: (context) => {
      const boxName = context.getValue<string>()
      return <ApplicationBoxDetailsDialog applicationId={applicationId} boxName={boxName} />
    },
  },
]
