import { ColumnDef } from '@tanstack/react-table'
import { NetworkConfig, useNetworksConfigs } from '@/features/settings/data'
import { trimCharacterFromEnd } from '@/utils/trim-character-from-end'
import { DataTable } from '@/features/common/components/data-table'
import { Button } from '@/features/common/components/button'
import { Dialog, DialogContent, DialogHeader, MediumSizeDialogBody } from '@/features/common/components/dialog'
import { useCallback, useState } from 'react'
import { NetworkForm } from '@/features/settings/components/network-form'

export function NetworksTable() {
  const networksConfigs = useNetworksConfigs()
  return (
    <>
      <h2>Networks</h2>
      <DataTable columns={tableColumns} data={networksConfigs} />
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
              <NetworkForm network={network} />
            </MediumSizeDialogBody>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}
