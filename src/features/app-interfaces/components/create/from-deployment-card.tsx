import { useCallback, useMemo } from 'react'
import { useCreateAppInterfaceStateMachine } from '../../data'
import { Card, CardContent } from '@/features/common/components/card'
import { Button } from '@/features/common/components/button'
import { useWallet } from '@txnlab/use-wallet-react'
import { deployAppLabel } from '../labels'

type Props = {
  machine: ReturnType<typeof useCreateAppInterfaceStateMachine>
}

export function FromDeploymentCard({ machine }: Props) {
  const { activeAddress } = useWallet()
  const [_state, send] = machine

  const fromDeploymentSelected = useCallback(() => {
    send({ type: 'fromAppDeploymentSelected' })
  }, [send])

  const disabledProps = useMemo(() => {
    return {
      disabled: !activeAddress,
      disabledReason: 'Please connect a wallet',
    }
  }, [activeAddress])

  return (
    <Card>
      <CardContent className="flex h-full flex-col space-y-6">
        <div className="flex flex-col">
          <h2>Deploy New App</h2>
          <span>Deploy a new app and create an app interface.</span>
        </div>
        <div className="flex grow flex-col">
          {/* eslint-disable-next-line tailwindcss/no-custom-classname  */}
          <div className="plausible-event-name=app-lab-deploy-new-app ml-auto mt-auto">
            <Button onClick={fromDeploymentSelected} {...disabledProps}>
              {deployAppLabel}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
