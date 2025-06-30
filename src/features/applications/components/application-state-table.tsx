import { ColumnDef } from '@tanstack/react-table'
import { ApplicationState, RawApplicationState } from '../models'
import { DataTable } from '@/features/common/components/data-table'
import { useMemo } from 'react'
import { DecodedAbiStorageValue } from '@/features/abi-methods/components/decoded-abi-storage-value'
import { DecodedAbiStorageKey } from '@/features/abi-methods/components/decoded-abi-storage-key'

type Props = {
  data: ApplicationState[] | React.ReactNode
}

export function ApplicationStateTable({ data }: Props) {
  const component = useMemo(() => {
    if (!Array.isArray(data) || data?.every((state) => 'type' in state)) {
      return <DataTable columns={rawTableColumns} data={data} dataContext="applicationState" />
    }
    return <DataTable columns={decodedTableColumns} data={data} dataContext="applicationState" />
  }, [data])

  return component
}

const decodedTableColumns: ColumnDef<ApplicationState>[] = [
  {
    header: 'Key',
    accessorFn: (item) => item,
    cell: (c) => {
      const key = c.getValue<ApplicationState>().key

      if (typeof key === 'string') {
        return key
      }

      return key.name
    },
  },
  {
    header: 'Decoded Key',
    accessorFn: (item) => item,
    cell: (c) => {
      const key = c.getValue<ApplicationState>().key

      if (typeof key === 'string') {
        return undefined
      }

      return <DecodedAbiStorageKey storageKey={key} />
    },
  },
  {
    header: 'Value',
    accessorFn: (item) => item,
    cell: (c) => {
      const globalState = c.getValue<ApplicationState>()

      if ('type' in globalState) {
        return globalState.value.toString()
      }

      return <DecodedAbiStorageValue value={globalState.value} />
    },
  },
]

const rawTableColumns: ColumnDef<RawApplicationState>[] = [
  {
    header: 'Key',
    accessorFn: (item) => item,
    cell: (c) => c.getValue<RawApplicationState>().key,
  },
  {
    header: 'Type',
    accessorFn: (item) => item,
    cell: (c) => c.getValue<RawApplicationState>().type,
  },
  {
    header: 'Value',
    accessorFn: (item) => item,
    cell: (c) => c.getValue<RawApplicationState>().value.toString(),
  },
]
