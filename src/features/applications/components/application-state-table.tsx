import { ColumnDef } from '@tanstack/react-table'
import { ApplicationState, RawApplicationState } from '../models'
import { DataTable } from '@/features/common/components/data-table'
import { useMemo } from 'react'
import { DecodedAbiStorageValue } from '@/features/abi-methods/components/decoded-abi-storage-value'
import { DecodedAbiStorageKey } from '@/features/abi-methods/components/decoded-abi-storage-key'
import { Loadable } from 'jotai/vanilla/utils/loadable'

type Props = {
  data: ApplicationState[] | Loadable<ApplicationState[]>
}

export function ApplicationStateTable({ data }: Props) {
  const component = useMemo(() => {
    const isRaw = (Array.isArray(data) ? data : data.state === 'hasData' ? data.data : undefined)?.every((state) => 'type' in state) ?? true
    return <DataTable columns={isRaw ? rawTableColumns : decodedTableColumns} data={data} dataContext="applicationState" />
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

const rawTableColumns: ColumnDef<ApplicationState>[] = [
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
