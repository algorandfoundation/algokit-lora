import { LazyLoadDataTable } from '@/features/common/components/lazy-load-data-table'
import { createLoadableApplicationBoxesPage } from '../data/application-boxes'
import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { ApplicationBoxDetailsDialog } from './application-box-details-dialog'
import { Application, BoxDescriptor } from '../models'
import { DecodedAbiStorageKey } from '@/features/abi-methods/components/decoded-abi-storage-key'

type Props = {
  application: Application
}

export function ApplicationBoxes({ application }: Props) {
  const createLoadablePage = useMemo(() => createLoadableApplicationBoxesPage(application), [application])
  const tableColumns = useMemo(() => createTableColumns(application), [application])

  return <LazyLoadDataTable columns={tableColumns} createLoadablePage={createLoadablePage} />
}

const createTableColumns = (application: Application): ColumnDef<BoxDescriptor>[] => {
  return [
    {
      header: 'Name',
      accessorFn: (item) => item,
      cell: (context) => {
        const boxDescriptor = context.getValue<BoxDescriptor>()
        return boxDescriptor.name
      },
    },
    ...(application.appSpec
      ? [
          {
            header: 'Decoded Name',
            accessorFn: (item) => item,
            cell: (context) => {
              const boxDescriptor = context.getValue<BoxDescriptor>()
              return 'valueType' in boxDescriptor ? <DecodedAbiStorageKey storageKey={boxDescriptor} /> : undefined
            },
          } satisfies ColumnDef<BoxDescriptor>,
        ]
      : []),
    {
      id: 'actions',
      header: '',
      accessorFn: (item) => item,
      cell: (context) => {
        const boxDescriptor = context.getValue<BoxDescriptor>()
        return (
          <div className="flex justify-end">
            <ApplicationBoxDetailsDialog application={application} boxDescriptor={boxDescriptor} />
          </div>
        )
      },
    },
  ]
}
