import { Trash2Icon } from 'lucide-react'
import { ConfirmButton } from '@/features/common/components/confirm-button'
import { AppInterfaceEntity } from '@/features/common/data/indexed-db'
import { useCallback } from 'react'
import { toast } from 'react-toastify'
import { useDeleteAppInterface } from '@/features/app-interfaces/data'

export const deleteAppInterfaceLabel = 'Delete App Interface'

type Props = {
  appInterface: AppInterfaceEntity
  onDelete: () => void
}

export function DeleteAppInterfaceButton({ appInterface, onDelete }: Props) {
  const deleteAppInterface = useDeleteAppInterface(appInterface.applicationId)

  const onConfirm = useCallback(async () => {
    await deleteAppInterface()
    toast.success(`App interface ${appInterface.name} has been removed`)
    onDelete()
  }, [appInterface.name, deleteAppInterface, onDelete])

  return (
    <ConfirmButton
      icon={<Trash2Icon className="text-secondary" />}
      size="sm"
      variant="no-style"
      dialogHeaderText={deleteAppInterfaceLabel}
      dialogContent={<div>Are you sure you want to delete '{appInterface.name}'?</div>}
      onConfirm={onConfirm}
    />
  )
}
