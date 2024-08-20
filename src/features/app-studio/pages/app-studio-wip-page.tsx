import { PageTitle } from '@/features/common/components/page-title'
import { appStudioPageTitle } from '@/features/app-studio/pages/app-studio-page'
import { useContractEntities } from '@/features/abi-methods/data'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { Contracts } from '@/features/app-studio/components/contracts'
import { PageLoader } from '@/features/common/components/page-loader'

export function AppStudioWipPage() {
  const [contractEntities, refreshContractEntities] = useContractEntities()

  return (
    <>
      <PageTitle title={appStudioPageTitle} />
      <RenderLoadable loadable={contractEntities} fallback={<PageLoader />}>
        {(contractEntities) => {
          return <Contracts contractEntities={contractEntities} onNewContractAdded={refreshContractEntities} />
        }}
      </RenderLoadable>
    </>
  )
}
