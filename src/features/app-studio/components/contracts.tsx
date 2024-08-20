import { ContractEntity } from '@/features/common/data/indexed-db'
import { useMemo } from 'react'
import { Card, CardContent } from '@/features/common/components/card'
import { DescriptionList } from '@/features/common/components/description-list'
import { dateFormatter } from '@/utils/format'
import { NewContractButton } from '@/features/app-studio/components/new-contract-button'

export const newContractLabel = 'New contract'

type Props = {
  contractEntities: ContractEntity[]
  onNewContractAdded: () => void
}
export function Contracts({ contractEntities, onNewContractAdded }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardContent className="flex min-h-44 flex-col">
          <h2>{newContractLabel}</h2>
          <div className="flex grow flex-col justify-between">
            <p>Upload an ARC-32 JSON file</p>
            <NewContractButton onSuccess={onNewContractAdded} />
          </div>
        </CardContent>
      </Card>
      {contractEntities.map((e, index) => (
        <ContractCard key={index} contractEntity={e} />
      ))}
    </div>
  )
}

function ContractCard({ contractEntity }: { contractEntity: ContractEntity }) {
  const { displayName } = contractEntity
  const items = useMemo(
    () => [
      {
        dt: 'Name',
        dd: contractEntity.appSpecVersions[0].appSpec.contract.name,
      },
      {
        dt: 'Methods',
        dd: contractEntity.appSpecVersions[0].appSpec.contract.methods.length,
      },
      {
        dt: 'App ID',
        dd: contractEntity.applicationId,
      },
    ],
    [contractEntity]
  )

  return (
    <Card>
      <CardContent className="flex min-h-44 flex-col">
        <h2>{displayName}</h2>
        <div className="flex grow flex-col justify-between">
          <DescriptionList items={items} />
          <p>Last modified: {dateFormatter.asShortDate(new Date(contractEntity.lastModified))}</p>
        </div>
      </CardContent>
    </Card>
  )
}
