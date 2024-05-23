import { ColumnDef } from '@tanstack/react-table'
import { ApplicationLink } from '@/features/applications/components/application-link'
import { ApplicationSummary } from '@/features/applications/models'

export const applicationsTableColumns: ColumnDef<ApplicationSummary>[] = [
  {
    header: 'ID',
    accessorFn: (item) => item.id,
    cell: (c) => <ApplicationLink applicationId={c.getValue<number>()} />,
  },
]
