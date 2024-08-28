import { useAssetOptInOut } from '@/features/assets/data/asset-opt-in-out'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { CircleArrowOutDownRight, CircleX, Loader2 as Loader } from 'lucide-react'
import { Button, AsyncActionButton } from '@/features/common/components/button'
import { Asset } from '@/features/assets/models'

const optInLabel = 'Opt-in'
const optOutLabel = 'Opt-out'

type ButtonProps = {
  onClick?: () => Promise<void>
  disabled?: boolean
  disabledReason?: string
}

function OptInButton(props: ButtonProps) {
  return (
    <AsyncActionButton {...props} className="w-28" variant="outline-secondary" icon={<CircleArrowOutDownRight size={16} />}>
      {optInLabel}
    </AsyncActionButton>
  )
}

function OptOutButton(props: ButtonProps) {
  return (
    <AsyncActionButton {...props} className="w-28" variant="outline-secondary" icon={<CircleX size={16} />}>
      {optOutLabel}
    </AsyncActionButton>
  )
}

function LoadingButton() {
  return <Button disabled={true} className="w-28" variant="outline-secondary" icon={<Loader className="size-6 animate-spin" />} />
}

export function AssetOptInOutButton({ asset }: { asset: Asset }) {
  const { status: assetOptInOutStatus, optIn, optOut } = useAssetOptInOut(asset)

  return (
    <RenderLoadable loadable={assetOptInOutStatus} fallback={<LoadingButton />}>
      {(status) => {
        if (status.canOptIn) return <OptInButton onClick={optIn} />
        else if (status.canOptOut) return <OptOutButton onClick={optOut} />
        else {
          return !status.hasActiveAccount ? (
            <OptInButton disabled={true} disabledReason="Please connect a wallet with min 0.101 ALGO" />
          ) : (
            <OptOutButton disabled={true} disabledReason="Please ensure the holding balance of this asset is 0" />
          )
        }
      }}
    </RenderLoadable>
  )
}
