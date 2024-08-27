import { Button } from '@/features/common/components/button'
import { deployToNetworkLabel } from '@/features/app-interfaces/components/labels'
import { ValidationErrorOrHelpMessage } from '@/features/forms/components/validation-error-or-help-message'

type Props = {
  canDeploy: boolean
  alreadyDeployed: boolean
  onClick: () => void
}

export function DeployAppButton({ canDeploy, alreadyDeployed, onClick }: Props) {
  return (
    <div className="grid">
      <Button
        type="button"
        variant="secondary"
        disabled={!canDeploy || alreadyDeployed}
        className="w-fit sm:mt-[1.375rem]"
        aria-label={deployToNetworkLabel}
        onClick={onClick}
      >
        {deployToNetworkLabel}
      </Button>
      {!canDeploy && <ValidationErrorOrHelpMessage errorText="Please connect a wallet with min 0.001 ALGO" />}
    </div>
  )
}
