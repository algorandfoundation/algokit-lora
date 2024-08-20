import { PageTitle } from '@/features/common/components/page-title'
import { Card, CardContent } from '@/features/common/components/card'
import { NewContractButton } from '@/features/app-lab/components/new-contract-button'

export const appLabPageTitle = 'App Lab'
export const newContractLabel = 'New contract'

export function AppLab() {
  return (
    <>
      <PageTitle title={appLabPageTitle} />
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="relative min-h-44 space-y-1">
            <h2>{newContractLabel}</h2>
            <p>Upload an ARC-32 JSON file</p>
            <NewContractButton />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
