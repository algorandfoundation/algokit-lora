import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/features/common/components/accordion'
import { FundAccountForm } from './fund-account-form'
import { NetworkConfig } from '@/features/network/data/types'
import { invariant } from '@/utils/invariant'
import { useDispenserApi } from '../data/dispenser-api'
import { DispenserApiUserInfo } from './dispenser-api-user-info'

type Props = {
  networkConfig: NetworkConfig
}

export function DispenserApiLoggedIn({ networkConfig }: Props) {
  invariant(networkConfig.dispenserApiUrl, 'Dispenser API URL is not configured')
  const { fundLimit, fundAccount } = useDispenserApi(networkConfig.dispenserApiUrl)

  return (
    <div className="flex flex-col gap-4 overflow-hidden xl:w-1/2">
      <DispenserApiUserInfo />
      <Accordion type="single" collapsible defaultValue="fund">
        <AccordionItem value="fund">
          <AccordionTrigger>Fund an existing {networkConfig.name} account</AccordionTrigger>
          <AccordionContent>
            <FundAccountForm onSubmit={fundAccount} limit={fundLimit} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="refund">
          <AccordionTrigger>Refund unused {networkConfig.name} ALGO</AccordionTrigger>
          <AccordionContent>Refunding is coming soon.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
