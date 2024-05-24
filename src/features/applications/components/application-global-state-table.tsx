import { ColumnDef } from '@tanstack/react-table'
import { Application, ApplicationGlobalStateValue } from '../models'
import { DataTable } from '@/features/common/components/data-table'
import { useMemo } from 'react'

type Props = {
  application: Application
}

export function ApplicationGlobalStateTable({ application }: Props) {
  const entries = useMemo(() => Array.from(application.globalState?.entries() ?? []), [application])
  return <DataTable columns={tableColumns} data={entries} />
}

const tableColumns: ColumnDef<[string, ApplicationGlobalStateValue]>[] = [
  {
    header: 'Key',
    accessorFn: (item) => item,
    cell: (c) => c.getValue<[string, ApplicationGlobalStateValue]>()[0],
  },
  {
    header: 'Type',
    accessorFn: (item) => item,
    cell: (c) => c.getValue<[string, ApplicationGlobalStateValue]>()[1].type,
  },
  {
    header: 'Value',
    accessorFn: (item) => item,
    cell: (c) => c.getValue<[string, ApplicationGlobalStateValue]>()[1].value,
  },
]
