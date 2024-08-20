import { ContractEntity } from '@/features/common/data/indexed-db'
import { useMemo } from 'react'
import { Card, CardContent } from '@/features/common/components/card'
import { DescriptionList } from '@/features/common/components/description-list'
import { dateFormatter } from '@/utils/format'
import { DeleteContractButton } from '@/features/app-studio/components/delete-contract-button'

type Props = {
  contract: ContractEntity
  onDelete: () => void
}

export function ContractCard({ contract, onDelete }: Props) {
  const { displayName } = contract
  const items = useMemo(
    () => [
      {
        dt: 'Name',
        dd: contract.appSpecVersions[0].appSpec.contract.name,
      },
      {
        dt: 'Methods',
        dd: contract.appSpecVersions[0].appSpec.contract.methods.length,
      },
      {
        dt: 'App ID',
        dd: contract.applicationId,
      },
    ],
    [contract]
  )

  return (
    <Card>
      <CardContent className="flex min-h-44 flex-col">
        <h2>{displayName}</h2>
        <div className="flex grow flex-col justify-between">
          <DescriptionList items={items} />
          <div className="flex items-center justify-between">
            <p>Last modified: {dateFormatter.asShortDate(new Date(contract.lastModified))}</p>
            <DeleteContractButton contract={contract} onDelete={onDelete} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
