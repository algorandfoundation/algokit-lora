import { useAssetOptInOut } from '@/features/assets/data/asset-opt-in-out'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { CircleArrowOutDownRight, CircleX, Loader2 as Loader } from 'lucide-react'
import { Button, AsyncActionButton } from '@/features/common/components/button'
import { Asset } from '@/features/assets/models'

export function AssetOptInOutButton({ asset }: { asset: Asset }) {
  const { status: assetOptInOutStatus, optIn, optOut } = useAssetOptInOut(asset)

  const optInButton = (
    <AsyncActionButton onClick={optIn} className={'w-28'} variant={'outlineSecondary'}>
      <CircleArrowOutDownRight /> Opt-in
    </AsyncActionButton>
  )
  const optOutButton = (
    <AsyncActionButton onClick={optOut} className={'w-28'} variant={'outlineSecondary'}>
      <CircleX /> Opt-out
    </AsyncActionButton>
  )
  const disabledButton = (
    <Button variant={'outlineSecondary'} disabled={true} className={'w-28'}>
      Opt-in
    </Button>
  )
  return (
    <RenderLoadable loadable={assetOptInOutStatus} fallback={<Loader className="size-10 animate-spin" />}>
      {(status) => {
        if (!status.canOptIn && !status.canOptOut) return disabledButton
        if (status.canOptIn) return optInButton
        if (status.canOptOut) return optOutButton
      }}
    </RenderLoadable>
  )
}
