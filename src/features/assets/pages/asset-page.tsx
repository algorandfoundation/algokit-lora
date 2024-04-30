import { invariant } from '@/utils/invariant'
import { UrlParams } from '../../../routes/urls'
import { useRequiredParam } from '../../common/hooks/use-required-param'
import { cn } from '@/features/common/utils'
import { isInteger } from '@/utils/is-integer'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { is404 } from '@/utils/error'
import { AssetDetails } from '../components/asset-details'
import { useLoadableAssetWithMetadataAtom } from '../data/asset-with-metadata'
import { AssetArc3Details } from '../components/asset-arc-3-details'
import { Arc3Asset } from '../models'

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
  const loadableAssetWithMetadata = useLoadableAssetWithMetadataAtom(assetId)

  return (
    <div>
      <h1 className={cn('text-2xl text-primary font-bold')}>{assetPageTitle}</h1>
      <RenderLoadable loadable={loadableAssetWithMetadata} transformError={transformError}>
        {(assetWithMetadata) => (
          <>
            {!assetWithMetadata.metadata && <AssetDetails asset={assetWithMetadata} />}
            {assetWithMetadata.metadata && assetWithMetadata.metadata.standard === 'ARC-3' && (
              <AssetArc3Details asset={assetWithMetadata as Arc3Asset} />
            )}
          </>
        )}
      </RenderLoadable>
    </div>
  )
}
