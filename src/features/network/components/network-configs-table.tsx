import { ColumnDef } from '@tanstack/react-table'
import {
  defaultNetworkConfigs,
  localnetId,
  useDeleteCustomNetworkConfig,
  useNetworkConfigs,
  useSelectedNetwork,
} from '@/features/network/data'
import { trimCharacterFromEnd } from '@/utils/trim-character-from-end'
import { DataTable } from '@/features/common/components/data-table'
import { Button } from '@/features/common/components/button'
import { Dialog, DialogContent, DialogHeader, MediumSizeDialogBody } from '@/features/common/components/dialog'
import { useCallback, useMemo, useState } from 'react'
import { EditNetworkConfigForm } from '@/features/network/components/edit-network-config-form'
import { CreateNetworkConfigForm } from '@/features/network/components/create-network-config-form'
import { ConfirmButton } from '@/features/common/components/confirm-button'
import { toast } from 'react-toastify'
import { NetworkConfigWithId } from '@/features/network/data/types'
import { Pencil, Plus, Trash, RotateCcw } from 'lucide-react'
import { useRefreshDataProviderToken } from '@/features/common/data'

export const networkConfigsTableLabel = 'Network Configs'
export const createNetworkConfigDialogLabel = 'Create Network'

export function NetworkConfigsTable() {
  const [createNetworkConfigDialogOpen, setCreateNetworkConfigDialogOpen] = useState(false)
  const networkConfigs = useNetworkConfigs()
  const data = useMemo<NetworkConfigWithId[]>(
    () => Object.entries(networkConfigs).map(([id, networkConfig]) => ({ id, ...networkConfig })),
    [networkConfigs]
  )

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <h2 className="pb-0">Networks</h2>
        <Button
          variant="outline-secondary"
          onClick={() => setCreateNetworkConfigDialogOpen(true)}
          className={'ml-auto w-28'}
          icon={<Plus size={16} />}
        >
          Create
        </Button>
      </div>
      <DataTable ariaLabel={networkConfigsTableLabel} columns={tableColumns} data={data} />
      <Dialog open={createNetworkConfigDialogOpen} onOpenChange={setCreateNetworkConfigDialogOpen} modal={true}>
        {createNetworkConfigDialogOpen && (
          <DialogContent className="bg-card" aria-label={createNetworkConfigDialogLabel}>
            <DialogHeader className="flex-row items-center space-y-0">
              <h2 className="pb-0">{createNetworkConfigDialogLabel}</h2>
            </DialogHeader>
            <MediumSizeDialogBody>
              <CreateNetworkConfigForm onSuccess={() => setCreateNetworkConfigDialogOpen(false)} />
            </MediumSizeDialogBody>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}

const tableColumns: ColumnDef<NetworkConfigWithId>[] = [
  {
    header: 'Name',
    accessorFn: (item) => item.name,
  },
  {
    header: 'Algod',
    meta: { className: 'hidden md:table-cell' },
    accessorFn: (item) => `${trimCharacterFromEnd(item.algod.server, '/')}:${item.algod.port}`,
  },
  {
    header: 'Indexer',
    meta: { className: 'hidden md:table-cell' },
    accessorFn: (item) => `${trimCharacterFromEnd(item.indexer.server, '/')}:${item.indexer.port}`,
  },
  {
    id: 'edit',
    header: '',
    meta: { className: 'w-24' },
    accessorFn: (item) => item,
    cell: (cell) => {
      const networkConfig = cell.getValue<NetworkConfigWithId>()
      return <EditNetworkButton networkConfig={networkConfig} />
    },
  },
  {
    id: 'delete',
    header: '',
    meta: { className: 'w-28' },
    accessorFn: (item) => item,
    cell: (cell) => {
      const networkConfig = cell.getValue<NetworkConfigWithId>()
      const isBuiltInNetwork = networkConfig.id in defaultNetworkConfigs
      const settingsHaveChanged = isBuiltInNetwork
        ? JSON.stringify({ id: networkConfig.id, ...defaultNetworkConfigs[networkConfig.id] }) !== JSON.stringify(networkConfig)
        : false

      return isBuiltInNetwork ? (
        <ResetNetworkButton networkConfig={networkConfig} settingsHaveChanged={settingsHaveChanged} />
      ) : (
        <DeleteNetworkButton networkConfig={networkConfig} />
      )
    },
  },
]

type ButtonProps = {
  networkConfig: NetworkConfigWithId
}

function EditNetworkButton({ networkConfig }: ButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const openDialog = useCallback(() => {
    setDialogOpen(true)
  }, [setDialogOpen])

  return (
    <>
      <Button variant="outline" onClick={openDialog} icon={<Pencil size={16} />}>
        Edit
      </Button>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={true}>
        <DialogContent className="bg-card">
          <DialogHeader className="flex-row items-center space-y-0">
            <h2 className="pb-0">Edit Network</h2>
          </DialogHeader>
          <MediumSizeDialogBody>
            <EditNetworkConfigForm networkConfig={networkConfig} onSuccess={() => setDialogOpen(false)} />
          </MediumSizeDialogBody>
        </DialogContent>
      </Dialog>
    </>
  )
}

function DeleteNetworkButton({ networkConfig }: ButtonProps) {
  const deleteNetworkConfig = useDeleteCustomNetworkConfig()
  const [selectedNetwork, setSelectedNetwork] = useSelectedNetwork()

  const deleteNetwork = useCallback(() => {
    deleteNetworkConfig(networkConfig.id)
    toast.success(`${networkConfig.name} has been deleted`)
    if (selectedNetwork === networkConfig.id) {
      setSelectedNetwork(localnetId)
    }
  }, [deleteNetworkConfig, networkConfig.id, networkConfig.name, selectedNetwork, setSelectedNetwork])

  return (
    <ConfirmButton
      variant="destructive"
      onConfirm={deleteNetwork}
      dialogHeaderText="Delete Network?"
      dialogContent={<div>Are you sure you want to delete '{networkConfig.name}'?</div>}
      icon={<Trash size={16} />}
      className="w-24"
    >
      Delete
    </ConfirmButton>
  )
}

type ResetNetworkButtonProps = ButtonProps & {
  settingsHaveChanged: boolean
}

function ResetNetworkButton({ networkConfig, settingsHaveChanged }: ResetNetworkButtonProps) {
  const deleteNetworkConfig = useDeleteCustomNetworkConfig()
  const refreshDataProviderToken = useRefreshDataProviderToken()
  const [selectedNetwork] = useSelectedNetwork()

  const resetNetworkToDefaults = useCallback(() => {
    deleteNetworkConfig(networkConfig.id)
    toast.success(`${networkConfig.name} has been reset`)
    if (networkConfig.id === selectedNetwork) {
      refreshDataProviderToken()
    }
  }, [deleteNetworkConfig, networkConfig.id, networkConfig.name, refreshDataProviderToken, selectedNetwork])

  return (
    <ConfirmButton
      variant="destructive"
      onConfirm={resetNetworkToDefaults}
      dialogHeaderText="Reset Network?"
      dialogContent={<div>Are you sure you want to reset '{networkConfig.name}' to the default settings?</div>}
      icon={<RotateCcw size={16} />}
      className="w-24"
      disabled={!settingsHaveChanged}
    >
      Reset
    </ConfirmButton>
  )
}
