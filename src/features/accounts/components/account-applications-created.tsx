import { DataTable } from '@/features/common/components/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { ApplicationLink } from '@/features/applications/components/application-link'
import { ApplicationSummary } from '@/features/applications/models'

type Props = {
  applicationsCreated: ApplicationSummary[]
}

const applicationsCreatedTableColumns: ColumnDef<ApplicationSummary>[] = [
  {
    header: 'ID',
    accessorFn: (item) => item.id,
    cell: (c) => <ApplicationLink applicationId={c.getValue<number>()} />,
  },
]

export function AccountApplicationsCreated({ applicationsCreated }: Props) {
  return <DataTable columns={applicationsCreatedTableColumns} data={applicationsCreated} />
}
