import { Button } from '@/features/common/components/button'
import { deployToNetworkLabel } from '@/features/app-interfaces/components/labels'
import { useActiveWalletAccount } from '@/features/wallet/data/active-wallet-account'
import { useMemo } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/features/common/components/tooltip'

type Props = {
  disabled: boolean
  onClick: () => void
}

export function DeployAppButton({ disabled, onClick }: Props) {
  const activeAccount = useActiveWalletAccount()
  const hasValidAccount = useMemo(() => {
    return activeAccount && activeAccount.algoHolding.amount > 1000
  }, [activeAccount])

  const button = useMemo(
    () => (
      <Button
        type="button"
        variant="secondary"
        disabled={!hasValidAccount || disabled}
        className="w-fit sm:mt-[1.375rem]"
        aria-label={deployToNetworkLabel}
        onClick={onClick}
      >
        {deployToNetworkLabel}
      </Button>
    ),
    [disabled, hasValidAccount, onClick]
  )

  return (
    <div className="grid">
      {hasValidAccount && button}
      {!hasValidAccount && (
        <Tooltip delayDuration={400}>
          <TooltipTrigger asChild>
            <div tabIndex={0}>{button}</div>
          </TooltipTrigger>
          <TooltipContent>
            <span>Please connect a wallet with min 0.001 ALGO</span>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}
