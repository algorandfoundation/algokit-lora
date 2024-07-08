import { useAssetOptInOut } from '@/features/assets/data/asset-opt-in-out'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { CircleArrowOutDownRight, CircleX, Loader2 as Loader } from 'lucide-react'
import { Button, AsyncActionButton } from '@/features/common/components/button'
import { Asset } from '@/features/assets/models'

const optInLabel = 'Opt-in'
const optOutLabel = 'Opt-out'

export function AssetOptInOutButton({ asset }: { asset: Asset }) {
  const { status: assetOptInOutStatus, optIn, optOut } = useAssetOptInOut(asset)

  const optInButton = (
    <AsyncActionButton onClick={optIn} className="w-28" variant="outline-secondary" icon={<CircleArrowOutDownRight />}>
      {optInLabel}
    </AsyncActionButton>
  )
  const optOutButton = (
    <AsyncActionButton onClick={optOut} className="w-28" variant="outline-secondary" icon={<CircleX />}>
      {optOutLabel}
    </AsyncActionButton>
  )
  const disabledButton = (
    <Button disabled={true} className="w-28" variant="outline-secondary" icon={<CircleArrowOutDownRight />}>
      {optInLabel}
    </Button>
  )
  const loadingButton = (
    <Button disabled={true} className="w-28" variant="outline-secondary" icon={<Loader className="size-6 animate-spin" />} />
  )
  return (
    <RenderLoadable loadable={assetOptInOutStatus} fallback={loadingButton}>
      {(status) => {
        if (!status.canOptIn && !status.canOptOut) return disabledButton
        if (status.canOptIn) return optInButton
        if (status.canOptOut) return optOutButton
      }}
    </RenderLoadable>
  )
}
