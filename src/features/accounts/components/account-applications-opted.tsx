import { DataTable } from '@/features/common/components/data-table'
import { AppLocalState } from '../data/types'
import { applicationsTableColumns } from './account-applications-table-columns'

type Props = {
  applicationsOpted: AppLocalState[]
}

export function AccountApplicationsOpted({ applicationsOpted }: Props) {
  return <DataTable columns={applicationsTableColumns} data={applicationsOpted} />
}
