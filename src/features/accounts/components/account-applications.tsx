import { DataTable } from '@/features/common/components/data-table'
import { AccountApplicationSummary } from '../models'
import { ColumnDef } from '@tanstack/react-table'
import { ApplicationLink } from '@/features/applications/components/application-link'
import { ApplicationSummary } from '@/features/applications/models'

type Props = {
  applications: AccountApplicationSummary[]
}

const applicationsTableColumns: ColumnDef<ApplicationSummary>[] = [
  {
    header: 'ID',
    accessorFn: (item) => item.id,
    cell: (c) => <ApplicationLink applicationId={c.getValue<number>()} />,
  },
]

export function AccountApplications({ applications }: Props) {
  return <DataTable columns={applicationsTableColumns} data={applications} />
}
