import { Button } from '@/features/common/components/button'
import { DataTable } from '@/features/common/components/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { AppInterfaceEntity } from '@/features/common/data/indexed-db'
import { AppSpecStandard, AppSpecVersion } from '../../data/types'
import { useCallback, useMemo, useState } from 'react'
import { Download, Pencil, Plus, Trash } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, MediumSizeDialogBody } from '@/features/common/components/dialog'
import { ConfirmButton } from '@/features/common/components/confirm-button'
import { asJson } from '@/utils/as-json'
import { AddAppSpecForm } from './add-app-spec-form'
import { ApplicationId } from '@/features/applications/data/types'
import { useDeleteAppSpec } from '../../data/update'
import { toast } from 'react-toastify'
import { EditAppSpecForm } from './edit-app-spec-form'
import { asAppSpecFilename } from '../../mappers'
import { Description } from '@radix-ui/react-dialog'

const appSpecsLabel = 'App Specs'

type Props = {
  appInterface: AppInterfaceEntity
  refreshAppInterface: () => void
}

export function AppSpecsTable({ appInterface, refreshAppInterface }: Props) {
  const tableColumns: ColumnDef<AppSpecVersion>[] = useMemo(() => {
    return [
      {
        header: 'Contract Name',
        accessorFn: (item) => {
          const contract = item.standard === AppSpecStandard.ARC32 ? item.appSpec.contract : item.appSpec
          return contract.name
        },
      },
      {
        header: 'Standard',
        accessorFn: (item) => item.standard,
      },
      {
        header: 'First valid round',
        accessorFn: (item) => item.roundFirstValid,
      },
      {
        header: 'Last valid round',
        accessorFn: (item) => item.roundLastValid,
      },

      {
        id: 'download',
        header: '',
        meta: { className: 'w-24' },
        accessorFn: (item) => item,
        cell: (cell) => {
          const appSpec = cell.getValue<AppSpecVersion>()
          return <DownloadAppSpecButton appSpec={appSpec} />
        },
      },
      {
        id: 'edit',
        header: '',
        meta: { className: 'w-24' },
        accessorFn: (item) => item,
        cell: (cell) => {
          const appSpec = cell.getValue<AppSpecVersion>()
          return (
            <EditAppSpecButton
              applicationId={appInterface.applicationId}
              appSpecIndex={cell.row.index}
              appSpec={appSpec}
              onSuccess={refreshAppInterface}
            />
          )
        },
      },
      {
        id: 'delete',
        header: '',
        meta: { className: 'w-28' },
        accessorFn: (item) => item,
        cell: (cell) => {
          return (
            <DeleteAppSpecButton applicationId={appInterface.applicationId} appSpecIndex={cell.row.index} onSuccess={refreshAppInterface} />
          )
        },
      },
    ]
  }, [appInterface.applicationId, refreshAppInterface])

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <h2 className="pb-0">{appSpecsLabel}</h2>
        <AddAppSpecButton applicationId={appInterface.applicationId} onSuccess={refreshAppInterface} />
      </div>
      <DataTable ariaLabel={appSpecsLabel} columns={tableColumns} data={appInterface.appSpecVersions} />
    </div>
  )
}

type DownloadAppSpecButton = {
  appSpec: AppSpecVersion
}

function DownloadAppSpecButton({ appSpec }: DownloadAppSpecButton) {
  const downloadAppSpec = useCallback(() => {
    const file = new Blob([asJson(appSpec.appSpec)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(file)
    link.setAttribute('download', asAppSpecFilename(appSpec))
    // TODO: This approach won't work in Tauri, so we'll need to handle with Tauri's APIs
    link.click()
  }, [appSpec])

  return (
    <Button variant="outline" onClick={downloadAppSpec} icon={<Download size={16} />}>
      Download
    </Button>
  )
}

type AddAppSpecButtonProps = {
  applicationId: ApplicationId
  onSuccess: () => void
}

function AddAppSpecButton({ applicationId, onSuccess }: AddAppSpecButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const openDialog = useCallback(() => {
    setDialogOpen(true)
  }, [])

  const complete = useCallback(() => {
    onSuccess()
    setDialogOpen(false)
  }, [onSuccess])

  return (
    <>
      <Button variant="outline-secondary" onClick={openDialog} className={'ml-auto w-28'} icon={<Plus size={16} />}>
        Add
      </Button>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={true}>
        <DialogContent className="bg-card">
          <Description hidden={true}>Add an app spec</Description>
          <DialogHeader className="flex-row items-center space-y-0">
            <DialogTitle asChild>
              <h2>Add App Spec</h2>
            </DialogTitle>
          </DialogHeader>
          <MediumSizeDialogBody>
            <AddAppSpecForm applicationId={applicationId} onSuccess={complete} />
          </MediumSizeDialogBody>
        </DialogContent>
      </Dialog>
    </>
  )
}

type EditAppSpecButtonProps = {
  applicationId: ApplicationId
  appSpecIndex: number
  appSpec: AppSpecVersion
  onSuccess: () => void
}

function EditAppSpecButton({ applicationId, appSpecIndex, appSpec, onSuccess }: EditAppSpecButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const openDialog = useCallback(() => {
    setDialogOpen(true)
  }, [setDialogOpen])

  const complete = useCallback(() => {
    onSuccess()
    setDialogOpen(false)
  }, [onSuccess])

  return (
    <>
      <Button variant="outline" onClick={openDialog} icon={<Pencil size={16} />}>
        Edit
      </Button>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={true}>
        <DialogContent className="bg-card">
          <Description hidden={true}>Edit an app spec</Description>
          <DialogHeader className="flex-row items-center space-y-0">
            <DialogTitle asChild>
              <h2>Edit App Spec</h2>
            </DialogTitle>
          </DialogHeader>
          <MediumSizeDialogBody>
            <EditAppSpecForm applicationId={applicationId} appSpec={appSpec} appSpecIndex={appSpecIndex} onSuccess={complete} />
          </MediumSizeDialogBody>
        </DialogContent>
      </Dialog>
    </>
  )
}

type DeleteAppSpecButtonProps = {
  applicationId: ApplicationId
  appSpecIndex: number
  onSuccess: () => void
}

function DeleteAppSpecButton({ applicationId, appSpecIndex, onSuccess }: DeleteAppSpecButtonProps) {
  const deleteAppSpec = useDeleteAppSpec()

  const deleteExistingAppSpec = useCallback(async () => {
    await deleteAppSpec(applicationId, appSpecIndex)
    onSuccess()
    toast.success('App spec has been deleted')
  }, [appSpecIndex, applicationId, deleteAppSpec, onSuccess])

  return (
    <ConfirmButton
      variant="destructive"
      onConfirm={deleteExistingAppSpec}
      dialogHeaderText="Delete Network?"
      dialogContent={<div>Are you sure you want to delete the app spec?</div>}
      icon={<Trash size={16} />}
      className="w-24"
    >
      Delete
    </ConfirmButton>
  )
}
