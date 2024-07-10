import { ColumnDef } from '@tanstack/react-table'
import { NetworkConfig, networksConfigs } from '@/features/settings/data'
import { trimCharacterFromEnd } from '@/utils/trim-character-from-end'
import { DataTable } from '@/features/common/components/data-table'

export function NetworksTable() {
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
]
