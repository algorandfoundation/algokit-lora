import { ColumnDef } from '@tanstack/react-table'
import { defaultNetworkConfigs, useDeleteCustomNetworkConfig, useNetworkConfigs } from '@/features/settings/data'
import { trimCharacterFromEnd } from '@/utils/trim-character-from-end'
import { DataTable } from '@/features/common/components/data-table'
import { Button } from '@/features/common/components/button'
import { Dialog, DialogContent, DialogHeader, MediumSizeDialogBody } from '@/features/common/components/dialog'
import { useCallback, useMemo, useState } from 'react'
import { EditNetworkConfigForm } from '@/features/settings/components/edit-network-config-form'
import { CreateNetworkConfigForm } from '@/features/settings/components/create-network-config-form'
import { ConfirmButton } from '@/features/common/components/confirm-button'
import { toast } from 'react-toastify'
import { NetworkConfigWithId } from '@/features/settings/data/types'

// move the header into the table
// TODO:  on small screens
export function NetworksConfigsTable() {
  const [createNetworkConfigDialogOpen, setCreateNetworkConfigDialogOpen] = useState(false)
  const networkConfigs = useNetworkConfigs()
  const data = useMemo<NetworkConfigWithId[]>(
    () => Object.entries(networkConfigs).map(([id, networkConfig]) => ({ id, ...networkConfig })),
    [networkConfigs]
  )

  return (
    <>
      <DataTable
        tableName={'Networks'}
        columns={tableColumns}
        data={data}
        onCreateButtonClick={() => setCreateNetworkConfigDialogOpen(true)}
      />
      <Dialog open={createNetworkConfigDialogOpen} onOpenChange={setCreateNetworkConfigDialogOpen} modal={true}>
        {createNetworkConfigDialogOpen && (
          <DialogContent className="bg-card">
            <DialogHeader className="flex-row items-center space-y-0">
              <h2 className="pb-0">Create Network</h2>
            </DialogHeader>
            <MediumSizeDialogBody>
              <CreateNetworkConfigForm onSuccess={() => setCreateNetworkConfigDialogOpen(false)} />
            </MediumSizeDialogBody>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}

const tableColumns: ColumnDef<NetworkConfigWithId>[] = [
  {
    header: 'Name',
    accessorFn: (item) => item.name,
  },
  {
    header: 'Indexer',
    accessorFn: (item) => `${trimCharacterFromEnd(item.indexer.server, '/')}:${item.indexer.port}`,
  },
  {
    header: 'Algod',
    accessorFn: (item) => `${trimCharacterFromEnd(item.algod.server, '/')}:${item.algod.port}`,
  },
  {
    id: 'edit',
    header: '',
    accessorFn: (item) => item,
    cell: (cell) => {
      const item = cell.getValue<NetworkConfigWithId>()
      return <EditNetworkButton network={item} />
    },
  },
  {
    id: 'delete',
    header: '',
    accessorFn: (item) => item,
    cell: (cell) => {
      const item = cell.getValue<NetworkConfigWithId>()

      return <DeleteNetworkButton network={item} />
    },
  },
]

function EditNetworkButton({ network }: { network: NetworkConfigWithId }) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const openDialog = useCallback(() => {
    setDialogOpen(true)
  }, [setDialogOpen])

  return (
    <>
      <Button className="ml-auto hidden w-28 md:flex" variant="outline" onClick={openDialog}>
        Edit
      </Button>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={true}>
        {dialogOpen && (
          <DialogContent className="bg-card">
            <DialogHeader className="flex-row items-center space-y-0">
              <h2 className="pb-0">Edit {network.name}</h2>
            </DialogHeader>
            <MediumSizeDialogBody>
              <EditNetworkConfigForm networkConfig={network} onSuccess={() => setDialogOpen(false)} />
            </MediumSizeDialogBody>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}

function DeleteNetworkButton({ network }: { network: NetworkConfigWithId }) {
  const isBuiltInNetwork = network.id in defaultNetworkConfigs
  const deleteNetworkConfig = useDeleteCustomNetworkConfig()
  const onConfirm = useCallback(() => {
    deleteNetworkConfig(network.id)
    toast.success('Network deleted')
  }, [deleteNetworkConfig, network])

  return (
    <ConfirmButton
      variant="destructive"
      onConfirm={onConfirm}
      dialogContent={<div>Are you sure you want to delete "{network.name}"?</div>}
      disabled={isBuiltInNetwork}
    >
      Delete
    </ConfirmButton>
  )
}
