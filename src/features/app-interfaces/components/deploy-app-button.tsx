import { Button } from '@/features/common/components/button'
import { deployToNetworkLabel } from '@/features/app-interfaces/components/labels'
import { ValidationErrorOrHelpMessage } from '@/features/forms/components/validation-error-or-help-message'
import { useActiveWalletAccount } from '@/features/wallet/data/active-wallet-account'
import { useMemo } from 'react'

type Props = {
  disabled: boolean
  onClick: () => void
}

export function DeployAppButton({ disabled, onClick }: Props) {
  const activeAccount = useActiveWalletAccount()
  const hasValidAccount = useMemo(() => {
    const result = activeAccount && activeAccount.algoHolding.amount > 1000
    return Boolean(result)
  }, [activeAccount])

  return (
    <div className="grid">
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
      {!hasValidAccount && <ValidationErrorOrHelpMessage errorText="Please connect a wallet with min 0.001 ALGO" />}
    </div>
  )
}
