import { cn } from '@/features/common/utils'
import { AccountLink } from '@/features/accounts/components/account-link'
import { ApplicationLink } from '@/features/applications/components/application-link'
import { graphConfig } from '@/features/transactions-graph/components/graph-config'
import { AssetIdLink } from '@/features/assets/components/asset-link'
import { Swimlane } from '@/features/transactions-graph'

// TODO: rename to lifeline
// message, self-message
export function SwimlaneId({ swimlane }: { swimlane: Swimlane }) {
  return (
    <h1 className={cn('text-l font-semibold')}>
      {swimlane.type === 'Account' && <AccountLink address={swimlane.address} short={true} />}
      {swimlane.type === 'Application' && (
        <div className={cn('grid')}>
          <ApplicationLink applicationId={swimlane.id} />
          <AccountLink address={swimlane.address} style={{ color: graphConfig.paymentTransactionColor }} short={true} />
          {swimlane.accounts.map(({ address, color }, index) => (
            <AccountLink key={index} address={address} style={{ color: color }} short={true} />
          ))}
        </div>
        // <Tooltip>
        //   <TooltipTrigger className={cn('grid')}>
        //     <ApplicationLink applicationId={swimlane.id} />
        //   </TooltipTrigger>
        //   <TooltipContent className={cn('font-normal')}>
        //     <ApplicationSwimlaneTooltipContent application={swimlane} />
        //   </TooltipContent>
        // </Tooltip>
      )}
      {swimlane.type === 'Asset' && <AssetIdLink assetId={parseInt(swimlane.id)} />}
    </h1>
  )
}

//
