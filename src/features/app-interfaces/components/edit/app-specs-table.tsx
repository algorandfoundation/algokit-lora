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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/features/common/components/tooltip'
import { downloadFile } from '@/features/common/download-file'

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
        id: 'actions',
        header: '',
        meta: { className: 'flex' },
        accessorFn: (item) => item,
        cell: (cell) => {
          const appSpec = cell.getValue<AppSpecVersion>()
          return (
            <div className="ml-auto flex items-center gap-2">
              <DownloadAppSpecButton appSpec={appSpec} />
              <EditAppSpecButton
                applicationId={appInterface.applicationId}
                appSpecIndex={cell.row.index}
                appSpec={appSpec}
                onSuccess={refreshAppInterface}
              />
              <DeleteAppSpecButton
                applicationId={appInterface.applicationId}
                appSpecIndex={cell.row.index}
                onSuccess={refreshAppInterface}
              />
            </div>
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
      <DataTable ariaLabel={appSpecsLabel} columns={tableColumns} data={appInterface.appSpecVersions} dataContext="appSpec" />
    </div>
  )
}

type DownloadAppSpecButton = {
  appSpec: AppSpecVersion
}

function DownloadAppSpecButton({ appSpec }: DownloadAppSpecButton) {
  const downloadAppSpec = useCallback(async () => {
    const file = new Blob([asJson(appSpec.appSpec)], { type: 'application/json' })
    await downloadFile(asAppSpecFilename(appSpec), file)
  }, [appSpec])

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon" onClick={downloadAppSpec} icon={<Download size={18} />} title="Download" />
      </TooltipTrigger>
      <TooltipContent>
        <p>Download App Spec</p>
      </TooltipContent>
    </Tooltip>
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
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" onClick={openDialog} icon={<Pencil size={18} />} title="Edit" />
        </TooltipTrigger>
        <TooltipContent>
          <p>Edit App Spec</p>
        </TooltipContent>
      </Tooltip>
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
      dialogContent={<p className="truncate">Are you sure you want to delete the app spec?</p>}
      icon={<Trash size={18} />}
      size="icon"
      title="Delete"
      tooltipContent={<p>Delete App Spec</p>}
    />
  )
}
