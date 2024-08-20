import { ContractEntity } from '@/features/common/data/indexed-db'
import { Card, CardContent } from '@/features/common/components/card'
import { NewContractButton } from '@/features/app-studio/components/new-contract-button'
import { ContractCard } from '@/features/app-studio/components/contract-card'

export const newContractLabel = 'New contract'

type Props = {
  contracts: ContractEntity[]
  refreshContracts: () => void
}
export function Contracts({ contracts, refreshContracts }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardContent className="flex min-h-44 flex-col">
          <h2>{newContractLabel}</h2>
          <div className="flex grow flex-col justify-between">
            <p>Upload an ARC-32 JSON file</p>
            <NewContractButton onSuccess={refreshContracts} />
          </div>
        </CardContent>
      </Card>
      {contracts.map((contract, index) => (
        <ContractCard key={index} contract={contract} onDelete={refreshContracts} />
      ))}
    </div>
  )
}
