import { useAssetOptInOut } from '@/features/assets/data/asset-opt-in-out'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { CircleArrowOutDownRight, CircleX, Loader2 as Loader } from 'lucide-react'
import { Button, AsyncActionButton } from '@/features/common/components/button'
import { Asset } from '@/features/assets/models'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/features/common/components/tooltip'

const optInLabel = 'Opt-in'
const optOutLabel = 'Opt-out'

type ButtonProps = {
  onClick?: () => Promise<void>
  disabled?: boolean
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
          const { reason, button } = !status.hasActiveAccount
            ? {
                reason: 'This action requires a connected wallet',
                button: <OptInButton disabled={true} />,
              }
            : {
                reason: 'This action requires a holding balance of 0',
                button: <OptOutButton disabled={true} />,
              }

          return (
            <Tooltip delayDuration={400}>
              <TooltipTrigger asChild>
                <div tabIndex={0}>{button}</div>
              </TooltipTrigger>
              <TooltipContent>
                <span>{reason}</span>
              </TooltipContent>
            </Tooltip>
          )
        }
      }}
    </RenderLoadable>
  )
}
