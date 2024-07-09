import { useAssetOptInOut } from '@/features/assets/data/asset-opt-in-out'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { CircleArrowOutDownRight, CircleX, Loader2 as Loader } from 'lucide-react'
import { Button, AsyncActionButton, AsyncActionButtonProps } from '@/features/common/components/button'
import { Asset } from '@/features/assets/models'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/features/common/components/tooltip'

const optInLabel = 'Opt-in'
const optOutLabel = 'Opt-out'

function OptInButton({ onClick }: Pick<AsyncActionButtonProps, 'onClick'>) {
  return (
    <AsyncActionButton onClick={onClick} className="w-28" variant="outline-secondary" icon={<CircleArrowOutDownRight size={16} />}>
      {optInLabel}
    </AsyncActionButton>
  )
}

function OptOutButton({ onClick }: Pick<AsyncActionButtonProps, 'onClick'>) {
  return (
    <AsyncActionButton onClick={onClick} className="w-28" variant="outline-secondary" icon={<CircleX size={16} />}>
      {optOutLabel}
    </AsyncActionButton>
  )
}

function LoadingButton() {
  return <Button disabled={true} className="w-28" variant="outline-secondary" icon={<Loader className="size-6 animate-spin" />} />
}

function DisabledButton() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0}>
          <Button disabled={true} className="w-28" variant="outline-secondary" icon={<CircleArrowOutDownRight size={16} />}>
            {optInLabel}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <span>Please connect your wallet to enable this action</span>
      </TooltipContent>
    </Tooltip>
  )
}

export function AssetOptInOutButton({ asset }: { asset: Asset }) {
  const { status: assetOptInOutStatus, optIn, optOut } = useAssetOptInOut(asset)

  return (
    <RenderLoadable loadable={assetOptInOutStatus} fallback={<LoadingButton />}>
      {(status) => {
        if (!status.canOptIn && !status.canOptOut) return <DisabledButton />
        if (status.canOptIn) return <OptInButton onClick={optIn} />
        if (status.canOptOut) return <OptOutButton onClick={optOut} />
      }}
    </RenderLoadable>
  )
}
