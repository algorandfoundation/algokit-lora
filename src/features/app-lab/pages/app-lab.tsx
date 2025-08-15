import { PageTitle } from '@/features/common/components/page-title'
import { useLoadableAppInterfaces } from '@/features/app-interfaces/data'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { PageLoader } from '@/features/common/components/page-loader'
import { AppInterfaces } from '@/features/app-interfaces/components/app-interfaces'
import { useTitle } from '@/utils/use-title'

export const appLabPageTitle = 'App Lab'

export function AppLab() {
  const [appInterfaces, refreshAppInterfaces] = useLoadableAppInterfaces()
  useTitle('App Lab')

  return (
    <>
      <PageTitle title={appLabPageTitle} />
      <RenderLoadable loadable={appInterfaces} fallback={<PageLoader />}>
        {(appInterfaces) => {
          return <AppInterfaces appInterfaces={appInterfaces} refreshAppInterfaces={refreshAppInterfaces} />
        }}
      </RenderLoadable>
    </>
  )
}
