import { DataTable } from '@/features/common/components/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { ApplicationLink } from '@/features/applications/components/application-link'
import { AppLocalState } from '../data/types'

type Props = {
  applicationsOpted: AppLocalState[]
}

const applicationsOptedTableColumns: ColumnDef<AppLocalState>[] = [
  {
    header: 'ID',
    accessorFn: (item) => item.id,
    cell: (c) => <ApplicationLink applicationId={c.getValue<number>()} />,
  },
]

export function AccountApplicationsCreated({ applicationsOpted }: Props) {
  return <DataTable columns={applicationsOptedTableColumns} data={applicationsOpted} />
}
