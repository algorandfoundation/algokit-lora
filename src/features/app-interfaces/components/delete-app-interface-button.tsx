import { TrashIcon } from 'lucide-react'
import { ConfirmButton } from '@/features/common/components/confirm-button'
import { AppInterfaceEntity } from '@/features/common/data/indexed-db'
import { useCallback } from 'react'
import { toast } from 'react-toastify'
import { useDeleteAppInterface } from '@/features/app-interfaces/data'
import { deleteAppInterfaceLabel } from '@/features/app-interfaces/components/labels'

type Props = {
  appInterface: AppInterfaceEntity
  onDelete: () => void
}

export function DeleteAppInterfaceButton({ appInterface, onDelete }: Props) {
  const deleteAppInterface = useDeleteAppInterface(appInterface.applicationId)

  const onConfirm = useCallback(async () => {
    await deleteAppInterface()
    toast.success(`App interface '${appInterface.name}' has been deleted`)
    onDelete()
  }, [appInterface.name, deleteAppInterface, onDelete])

  return (
    <ConfirmButton
      icon={<TrashIcon size={16} />}
      size="sm"
      variant="destructive"
      dialogHeaderText={deleteAppInterfaceLabel}
      dialogContent={<div>Are you sure you want to delete '{appInterface.name}'?</div>}
      onConfirm={onConfirm}
    />
  )
}
