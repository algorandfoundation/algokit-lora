import { ColumnDef } from '@tanstack/react-table'
import { NetworkConfig, useNetworksConfigs } from '@/features/settings/data'
import { trimCharacterFromEnd } from '@/utils/trim-character-from-end'
import { DataTable } from '@/features/common/components/data-table'
import { Button } from '@/features/common/components/button'
import { Dialog, DialogContent, DialogHeader, MediumSizeDialogBody } from '@/features/common/components/dialog'
import { useCallback, useState } from 'react'
import { EditNetworkConfigForm } from '@/features/settings/components/edit-network-config-form'
import { CreateNetworkConfigForm } from '@/features/settings/components/create-network-config-form'

// TODO: delete, on small screens
export function NetworksConfigsTable() {
  const [createNetworkConfigDialogOpen, setCreateNetworkConfigDialogOpen] = useState(false)
  const networksConfigs = useNetworksConfigs()
  return (
    <>
      <h2>Networks</h2>
      <DataTable columns={tableColumns} data={networksConfigs} onCreateButtonClick={() => setCreateNetworkConfigDialogOpen(true)} />
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

const tableColumns: ColumnDef<NetworkConfig>[] = [
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
    header: 'KMD',
    accessorFn: (item) => (item.kmd ? `${trimCharacterFromEnd(item.kmd.server, '/')}:${item.kmd.port}` : ''),
  },
  {
    id: 'edit',
    header: '',
    accessorFn: (item) => item,
    cell: (cell) => {
      const item = cell.getValue<NetworkConfig>()
      return <EditNetworkButton network={item} />
    },
  },
  {
    id: 'delete',
    header: '',
    accessorFn: (item) => item,
    cell: () => {
      return (
        <Button variant="destructive" onClick={() => console.log('delete')}>
          Delete
        </Button>
      )
    },
  },
]

function EditNetworkButton({ network }: { network: NetworkConfig }) {
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
              <EditNetworkConfigForm network={network} onSuccess={() => setDialogOpen(false)} />
            </MediumSizeDialogBody>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}
