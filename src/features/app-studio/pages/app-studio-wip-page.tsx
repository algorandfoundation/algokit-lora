import { PageTitle } from '@/features/common/components/page-title'
import { appStudioPageTitle } from '@/features/app-studio/pages/app-studio-page'
import { Card, CardContent } from '@/features/common/components/card'
import { NewContractButton } from '@/features/app-studio/components/new-contract-button'

export const newContractLabel = 'New contract'

export function AppStudioWipPage() {
  return (
    <>
      <PageTitle title={appStudioPageTitle} />
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="relative min-h-44 space-y-1">
            <h2>{newContractLabel}</h2>
            <p>Upload an ARC-04 or ARC-32 JSON file</p>
            <NewContractButton />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
