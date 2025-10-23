import { Dialog, DialogContent, DialogHeader, DialogTitle, MediumSizeDialogBody } from '@/features/common/components/dialog'
import { TokenPromptForm } from './token-prompt-form'
import { NetworkSelect } from '@/features/network/components/network-select'
import { useNetworkConfig } from '@/features/network/data'
import { Alert } from '@/features/common/components/alert'
import { Description } from '@radix-ui/react-dialog'

export function TokenPromptDialog() {
  const networkConfig = useNetworkConfig()

  return (
    <Dialog open={true} modal={true}>
      <DialogContent className="bg-card" hideClose={true}>
        <Description hidden={true}>Supply network tokens</Description>
        <DialogHeader className="space-y-0">
          <DialogTitle asChild>
            <h2>Network Tokens</h2>
          </DialogTitle>
        </DialogHeader>
        <MediumSizeDialogBody className="flex flex-col space-y-4">
          <Alert className="rounded-md break-all" variant="default">
            Please supply the tokens for {networkConfig.name} or switch networks.
          </Alert>
          <NetworkSelect />
          <TokenPromptForm networkConfig={networkConfig} />
        </MediumSizeDialogBody>
      </DialogContent>
    </Dialog>
  )
}
