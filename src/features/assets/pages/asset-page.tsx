import { invariant } from '@/utils/invariant'
import { UrlParams } from '../../../routes/urls'
import { useRequiredParam } from '../../common/hooks/use-required-param'
import { isInteger } from '@/utils/is-integer'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { is404 } from '@/utils/error'
import { AssetDetails } from '../components/asset-details'
import { useLoadableAsset } from '../data'
import { useCallback } from 'react'
import { PageTitle } from '@/features/common/components/page-title'
import { PageLoader } from '@/features/common/components/page-loader'

const transformError = (e: Error) => {
  if (is404(e)) {
    return new Error(assetNotFoundMessage)
  }

  // eslint-disable-next-line no-console
  console.error(e)
  return new Error(assetFailedToLoadMessage)
}

export const assetPageTitle = 'Asset'
export const assetNotFoundMessage = 'Asset not found'
export const assetInvalidIdMessage = 'Asset Id is invalid'
export const assetFailedToLoadMessage = 'Asset failed to load'

export function AssetPage() {
  const { assetId: _assetId } = useRequiredParam(UrlParams.AssetId)
  invariant(isInteger(_assetId), assetInvalidIdMessage)

  const assetId = parseInt(_assetId, 10)
  const [loadableAsset, refreshAsset, isStale] = useLoadableAsset(assetId)

  const refresh = useCallback(() => {
    refreshAsset()
  }, [refreshAsset])

  return (
    <>
      <PageTitle title={assetPageTitle} canRefreshPage={isStale} onRefresh={refresh} />
      <RenderLoadable loadable={loadableAsset} transformError={transformError} fallback={<PageLoader />}>
        {(asset) => <AssetDetails asset={asset} />}
      </RenderLoadable>
    </>
  )
}
