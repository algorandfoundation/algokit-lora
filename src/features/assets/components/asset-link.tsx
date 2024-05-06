import { cn } from '@/features/common/utils'
import { TemplatedNavLink } from '@/features/routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '@/routes/urls'
import { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  assetId: number
  assetName?: string
  className?: string
}>

export function AssetLink({ assetId, assetName, className, children }: Props) {
  return (
    <span>
      <TemplatedNavLink
        className={cn(!children && 'text-primary underline', className)}
        urlTemplate={Urls.Explore.Asset.ById}
        urlParams={{ assetId: assetId.toString() }}
      >
        {children ? children : assetId}
      </TemplatedNavLink>
      {assetName && ` (${assetName})`}
    </span>
  )
}
