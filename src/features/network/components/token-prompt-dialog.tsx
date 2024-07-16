import { Dialog, DialogContent, DialogHeader, MediumSizeDialogBody } from '@/features/common/components/dialog'
import { TokenPromptForm } from './token-prompt-form'
import { NetworkSelect } from '@/features/settings/components/network-select'
import { useNetworkConfig } from '@/features/settings/data'

export function TokenPromptDialog() {
  const networkConfig = useNetworkConfig()

  return (
    <Dialog open={true} modal={true}>
      <DialogContent className="bg-card" hideClose={true}>
        <DialogHeader className="space-y-0">
          <h2 className="pb-0">Network Tokens</h2>
        </DialogHeader>
        <MediumSizeDialogBody className="flex flex-col space-y-2">
          <p>Please supply the service tokens for {networkConfig.name} or switch networks.</p>
          <NetworkSelect />
          <TokenPromptForm networkConfig={networkConfig} />
        </MediumSizeDialogBody>
      </DialogContent>
    </Dialog>
  )
}
