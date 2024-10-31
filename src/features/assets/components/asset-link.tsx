import { cn } from '@/features/common/utils'
import { TemplatedNavLink } from '@/features/routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '@/routes/urls'
import { PropsWithChildren } from 'react'
import { AssetSummary } from '../models'
import { AsyncMaybeAtom } from '@/features/common/data/types'
import { RenderInlineAsyncAtom } from '@/features/common/components/render-inline-async-atom'
import { CopyButton } from '@/features/common/components/copy-button'
import { useSelectedNetwork } from '@/features/network/data'

type CommonProps = {
  className?: string
  showCopyButton?: boolean
}

type AssetIdLinkProps = PropsWithChildren<
  {
    assetId: number
  } & CommonProps
>

type AssetIdAndNameLinkProps = PropsWithChildren<
  {
    assetId: number
    assetName?: string
  } & CommonProps
>

type AssetLinkProps = PropsWithChildren<
  {
    asset: AssetSummary | AsyncMaybeAtom<AssetSummary>
  } & CommonProps
>

function Link(props: AssetIdLinkProps | AssetIdAndNameLinkProps) {
  const [selectedNetwork] = useSelectedNetwork()
  const link = (
    <TemplatedNavLink
      className={cn(!props.children && 'text-primary underline truncate', props.className)}
      urlTemplate={Urls.Explore.Asset.ById}
      urlParams={{ assetId: props.assetId.toString(), networkId: selectedNetwork }}
    >
      {props.children ? props.children : props.assetId}
    </TemplatedNavLink>
  )

  return props.children ? (
    link
  ) : (
    <div className="flex items-center">
      {link}
      {'assetName' in props && props.assetName && <span className="ml-1 truncate">({props.assetName})</span>}
      {props.showCopyButton && <CopyButton value={props.assetId.toString()} />}
    </div>
  )
}

export function AssetLink({ asset, className, ...rest }: AssetLinkProps) {
  return 'read' in asset ? (
    <RenderInlineAsyncAtom atom={asset}>
      {(asset) => <Link assetId={asset.id} assetName={asset.name} className={className} {...rest} />}
    </RenderInlineAsyncAtom>
  ) : (
    <Link assetId={asset.id} assetName={asset.name} className={className} {...rest} />
  )
}

export function AssetIdAndNameLink({ assetId, assetName, className, ...rest }: AssetIdAndNameLinkProps) {
  return <Link assetId={assetId} assetName={assetName} className={className} {...rest} />
}

export function AssetIdLink({ assetId, className, ...rest }: AssetIdLinkProps) {
  return <Link assetId={assetId} className={className} {...rest} />
}
