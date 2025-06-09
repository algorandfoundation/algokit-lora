import { applicationBoxNameLabel, applicationBoxValueLabel } from './labels'
import { Application, BoxDescriptor } from '../models'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { useLoadableApplicationBox } from '../data/application-boxes'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, MediumSizeDialogBody } from '@/features/common/components/dialog'
import { base64ToUtf8IfValid } from '@/utils/base64-to-utf8'
import { Description } from '@radix-ui/react-dialog'
import { Button } from '@/features/common/components/button'
import { DecodedAbiStorageValue as DecodedAbiStorageValueModel } from '@/features/abi-methods/models'
import { DecodedAbiStorageValue } from '@/features/abi-methods/components/decoded-abi-storage-value'
import { DecodedAbiStorageKey } from '@/features/abi-methods/components/decoded-abi-storage-key'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/features/common/components/data-table'
import { useMemo } from 'react'

type Props = {
  application: Application
  boxDescriptor: BoxDescriptor
}

const dialogTitle = 'Application Box'
export function ApplicationBoxDetailsDialog({ application, boxDescriptor }: Props) {
  return (
    <Dialog modal={true}>
      <DialogTrigger asChild>
        <Button variant="link">View</Button>
      </DialogTrigger>
      <DialogContent>
        <Description hidden={true}>Box information</Description>
        <DialogHeader>
          <DialogTitle asChild>
            <h2>{dialogTitle}</h2>
          </DialogTitle>
        </DialogHeader>
        <MediumSizeDialogBody className="text-sm">
          <InternalDialogContent application={application} boxDescriptor={boxDescriptor} />
        </MediumSizeDialogBody>
      </DialogContent>
    </Dialog>
  )
}

function InternalDialogContent({ application, boxDescriptor }: { application: Application; boxDescriptor: BoxDescriptor }) {
  const loadableApplicationBox = useLoadableApplicationBox(application, boxDescriptor)
  const boxTableColumns = useMemo(() => createTableColumns(application), [application])

  return (
    <RenderLoadable loadable={loadableApplicationBox}>
      {(applicationBox) => (
        <DataTable
          columns={boxTableColumns}
          data={[{ boxDescriptor, boxValue: applicationBox }]}
          hidePagination={true}
          dataContext="applicationState"
        />
      )}
    </RenderLoadable>
  )
}

type BoxDetails = {
  boxDescriptor: BoxDescriptor
  boxValue: string | DecodedAbiStorageValueModel
}
const createTableColumns = (application: Application): ColumnDef<BoxDetails>[] => {
  return [
    {
      header: applicationBoxNameLabel,
      accessorFn: (item) => item,
      cell: (context) => {
        const { boxDescriptor } = context.getValue<BoxDetails>()
        return boxDescriptor.name
      },
    },
    ...(application.appSpec
      ? [
          {
            header: 'Decoded Name',
            accessorFn: (item) => item,
            cell: (context) => {
              const { boxDescriptor } = context.getValue<BoxDetails>()
              return 'valueType' in boxDescriptor ? <DecodedAbiStorageKey storageKey={boxDescriptor} /> : undefined
            },
          } satisfies ColumnDef<BoxDetails>,
        ]
      : []),
    {
      header: applicationBoxValueLabel,
      accessorFn: (item) => item,
      cell: (context) => {
        const { boxValue } = context.getValue<BoxDetails>()
        return typeof boxValue === 'string' ? <RawBoxValue boxValue={boxValue} /> : <DecodedAbiStorageValue value={boxValue} />
      },
    },
  ]
}

function RawBoxValue({ boxValue }: { boxValue: string }) {
  const decodedBoxValue = base64ToUtf8IfValid(boxValue)

  return (
    <div className="grid">
      <div className="overflow-y-auto break-words"> {decodedBoxValue}</div>
    </div>
  )
}
