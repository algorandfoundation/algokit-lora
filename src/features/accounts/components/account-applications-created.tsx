import { DataTable } from '@/features/common/components/data-table'
import { ApplicationSummary } from '@/features/applications/models'
import { applicationsTableColumns } from './account-applications-table-columns'
type Props = {
  applicationsCreated: ApplicationSummary[]
}

export function AccountApplicationsCreated({ applicationsCreated }: Props) {
  return <DataTable columns={applicationsTableColumns} data={applicationsCreated} />
}
