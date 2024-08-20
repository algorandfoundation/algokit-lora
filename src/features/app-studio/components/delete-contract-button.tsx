import { Trash2Icon } from 'lucide-react'
import { ConfirmButton } from '@/features/common/components/confirm-button'
import { ContractEntity } from '@/features/common/data/indexed-db'
import { useDeleteContractEntity } from '@/features/abi-methods/data'
import { useCallback } from 'react'
import { toast } from 'react-toastify'

type Props = {
  contract: ContractEntity
  onDelete: () => void
}
export function DeleteContractButton({ contract, onDelete }: Props) {
  const deleteContract = useDeleteContractEntity(contract.applicationId)

  const onConfirm = useCallback(async () => {
    await deleteContract()
    toast.success(`Contract "${contract.displayName}" has been removed`)
    onDelete()
  }, [contract.displayName, deleteContract, onDelete])

  return (
    <ConfirmButton
      icon={<Trash2Icon className="text-secondary" />}
      size="sm"
      variant="no-style"
      dialogHeaderText="Remove contract"
      dialogContent={`Are you sure you want to remove "${contract.displayName}"?`}
      onConfirm={onConfirm}
    />
  )
}
