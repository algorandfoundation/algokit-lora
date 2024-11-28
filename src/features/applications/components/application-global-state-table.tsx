import { ColumnDef } from '@tanstack/react-table'
import { Application, GlobalState, RawGlobalState } from '../models'
import { DataTable } from '@/features/common/components/data-table'
import { useMemo } from 'react'
import { DecodedAbiStorageValue } from '@/features/abi-methods/components/decoded-abi-storage-value'
import { DecodedAbiStorageKey } from '@/features/abi-methods/components/decoded-abi-storage-key'

type Props = {
  application: Application
}

export function ApplicationGlobalStateTable({ application }: Props) {
  const component = useMemo(() => {
    if (application.globalState?.every((state) => 'type' in state)) {
      return <DataTable columns={rawTableColumns} data={application.globalState ?? []} />
    }
    return <DataTable columns={decodedTableColumns} data={application.globalState ?? []} />
  }, [application.globalState])

  return component
}

const decodedTableColumns: ColumnDef<GlobalState>[] = [
  {
    header: 'Key',
    accessorFn: (item) => item,
    cell: (c) => {
      const key = c.getValue<GlobalState>().key

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
      const key = c.getValue<GlobalState>().key

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
      const globalState = c.getValue<GlobalState>()

      if ('type' in globalState) {
        return globalState.value.toString()
      }

      return <DecodedAbiStorageValue value={globalState.value} />
    },
  },
]

const rawTableColumns: ColumnDef<RawGlobalState>[] = [
  {
    header: 'Key',
    accessorFn: (item) => item,
    cell: (c) => c.getValue<RawGlobalState>().key,
  },
  {
    header: 'Type',
    accessorFn: (item) => item,
    cell: (c) => c.getValue<RawGlobalState>().type,
  },
  {
    header: 'Value',
    accessorFn: (item) => item,
    cell: (c) => c.getValue<RawGlobalState>().value,
  },
]
