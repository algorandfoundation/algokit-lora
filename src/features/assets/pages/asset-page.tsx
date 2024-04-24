import { invariant } from '@/utils/invariant'
import { UrlParams } from '../../../routes/urls'
import { useRequiredParam } from '../../common/hooks/use-required-param'
import { cn } from '@/features/common/utils'
import { isInteger } from '@/utils/is-integer'

export const assetPageTitle = 'Asset'
export const assetInvalidIdMessage = 'Asset Id is invalid'

export function AssetPage() {
  const { assetId } = useRequiredParam(UrlParams.AssetId)
  invariant(isInteger(assetId), assetInvalidIdMessage)

  return (
    <div>
      <h1 className={cn('text-2xl text-primary font-bold')}>{assetPageTitle}</h1>
      {assetId}
    </div>
  )
}
