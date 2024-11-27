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
import { Dialog, DialogContent, DialogHeader, DialogTitle, MediumSizeDialogBody } from '@/features/common/components/dialog'
import { useCallback, useMemo, useState } from 'react'
import { EditNetworkConfigForm } from '@/features/network/components/edit-network-config-form'
import { CreateNetworkConfigForm } from '@/features/network/components/create-network-config-form'
import { ConfirmButton } from '@/features/common/components/confirm-button'
import { toast } from 'react-toastify'
import { NetworkConfigWithId } from '@/features/network/data/types'
import { Pencil, Plus, Trash, RotateCcw, Plug, CircleCheck } from 'lucide-react'
import { useRefreshDataProviderToken } from '@/features/common/data'
import { Description } from '@radix-ui/react-dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/features/common/components/tooltip'

export const networkConfigsTableLabel = 'Network Configs'
export const createNetworkConfigDialogLabel = 'Create Network'

const ICON_BUTTON_SIZE = 18

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
            <Description hidden={true}>Create a network</Description>
            <DialogHeader className="flex-row items-center space-y-0">
              <DialogTitle asChild>
                <h2>{createNetworkConfigDialogLabel}</h2>
              </DialogTitle>
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
    id: 'actions',
    header: '',
    meta: { className: 'flex' },
    accessorFn: (item) => item,
    cell: (cell) => {
      const activateNetworkConfig = cell.getValue<NetworkConfigWithId>()
      const editNetworkConfig = cell.getValue<NetworkConfigWithId>()
      // Edit and Delete buttons
      const networkConfig = cell.getValue<NetworkConfigWithId>()
      const isBuiltInNetwork = networkConfig.id in defaultNetworkConfigs
      const settingsHaveChanged = isBuiltInNetwork
        ? JSON.stringify({ id: networkConfig.id, ...defaultNetworkConfigs[networkConfig.id] }) !== JSON.stringify(networkConfig)
        : false
      const ResetOrDeleteButton = isBuiltInNetwork ? (
        <ResetNetworkButton networkConfig={networkConfig} settingsHaveChanged={settingsHaveChanged} />
      ) : (
        <DeleteNetworkButton networkConfig={networkConfig} />
      )
      return (
        <div className="ml-auto flex items-center gap-2">
          <ActivateButton networkConfig={activateNetworkConfig} />
          <EditNetworkButton networkConfig={editNetworkConfig} />
          {ResetOrDeleteButton}
        </div>
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
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" onClick={openDialog} size="icon" icon={<Pencil size={ICON_BUTTON_SIZE} />} title="Edit" />
        </TooltipTrigger>
        <TooltipContent>
          <p>{`Edit ${networkConfig.name}`}</p>
        </TooltipContent>
      </Tooltip>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={true}>
        <DialogContent className="bg-card">
          <Description hidden={true}>Edit a network</Description>
          <DialogHeader className="flex-row items-center space-y-0">
            <DialogTitle asChild>
              <h2>Edit Network</h2>
            </DialogTitle>
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
      dialogContent={<p className="truncate">Are you sure you want to delete '{networkConfig.name}'?</p>}
      size="icon"
      icon={<Trash size={ICON_BUTTON_SIZE} />}
      title="Delete"
      tooltipContent={<p>Delete {networkConfig.name}</p>}
    />
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
      variant="outline"
      onConfirm={resetNetworkToDefaults}
      dialogHeaderText="Reset Network?"
      dialogContent={<p className="truncate">Are you sure you want to reset '{networkConfig.name}' to the default settings?</p>}
      size="icon"
      icon={<RotateCcw size={ICON_BUTTON_SIZE} />}
      disabled={!settingsHaveChanged}
      title="Reset"
      tooltipContent={<p>{`Reset ${networkConfig.name}`}</p>}
    />
  )
}

function ActivateButton({ networkConfig }: ButtonProps) {
  const [selectedNetwork, setSelectedNetwork] = useSelectedNetwork()
  const isNetworkActive = selectedNetwork === networkConfig.id

  return (
    <>
      {isNetworkActive ? (
        <Button
          variant="ghost"
          size="icon"
          className="pointer-events-none text-primary"
          icon={<CircleCheck size={ICON_BUTTON_SIZE} />}
          title="Active"
        />
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              icon={<Plug size={ICON_BUTTON_SIZE} onClick={() => setSelectedNetwork(networkConfig.id)} />}
              title="Activate"
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>{`Activate ${networkConfig.name}`}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </>
  )
}
