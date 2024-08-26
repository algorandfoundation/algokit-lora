import { Button } from '@/features/common/components/button'
import { deployAppLabel, deployToNetworkLabel } from '@/features/app-interfaces/components/labels'
import { ValidationErrorOrHelpMessage } from '@/features/forms/components/validation-error-or-help-message'
import { useToggle } from '@/features/common/hooks/use-toggle'
import { Dialog, DialogContent, DialogHeader, MediumSizeDialogBody } from '@/features/common/components/dialog'
import { ApplicationId } from '@/features/applications/data/types'
import { DeployAppForm } from '@/features/app-interfaces/components/deploy-app-form'
import { Arc32AppSpec } from '../data/types'

type Props = {
  appSpec: Arc32AppSpec
  canDeploy: boolean
  onSuccess: (appId: ApplicationId) => void
}

export function DeployAppButton({ appSpec, canDeploy, onSuccess: _onSuccess }: Props) {
  const { on, off, state: dialogOpen } = useToggle(false)

  return (
    <>
      <div className="grid">
        <Button
          type="button"
          variant="secondary"
          disabled={!canDeploy}
          className="w-fit sm:mt-[1.375rem]"
          aria-label={deployToNetworkLabel}
          onClick={on}
        >
          {deployToNetworkLabel}
        </Button>
        {!canDeploy && <ValidationErrorOrHelpMessage errorText="Please connect a wallet with min 0.001 ALGO" />}
      </div>
      <Dialog open={dialogOpen} onOpenChange={(open) => (open ? on() : off())} modal={true}>
        <DialogContent className="bg-card">
          <DialogHeader className="flex-row items-center space-y-0">
            <h2 className="pb-0">{deployAppLabel}</h2>
          </DialogHeader>
          <MediumSizeDialogBody>
            <DeployAppForm appSpec={appSpec} />
          </MediumSizeDialogBody>
        </DialogContent>
      </Dialog>
    </>
  )
}
