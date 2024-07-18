import { Dialog, DialogContent, DialogHeader, MediumSizeDialogBody } from '@/features/common/components/dialog'
import { TokenPromptForm } from './token-prompt-form'
import { NetworkSelect } from '@/features/network/components/network-select'
import { useNetworkConfig } from '@/features/network/data'
import { Alert } from '@/features/common/components/alert'

export function TokenPromptDialog() {
  const networkConfig = useNetworkConfig()

  return (
    <Dialog open={true} modal={true}>
      <DialogContent className="bg-card" hideClose={true}>
        <DialogHeader className="space-y-0">
          <h2 className="pb-0">Network Tokens</h2>
        </DialogHeader>
        <MediumSizeDialogBody className="flex flex-col space-y-4">
          <Alert className="rounded-md" variant="default">
            Please supply the tokens for {networkConfig.name} or switch networks.
          </Alert>
          <NetworkSelect />
          <TokenPromptForm networkConfig={networkConfig} />
        </MediumSizeDialogBody>
      </DialogContent>
    </Dialog>
  )
}
