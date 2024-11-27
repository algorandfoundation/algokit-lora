import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/features/common/components/accordion'
import { FundAccountForm } from './fund-account-form'
import { NetworkConfigWithId } from '@/features/network/data/types'
import { invariant } from '@/utils/invariant'
import { useDispenserApi } from '../data/dispenser-api'
import { DispenserApiUserInfo } from './dispenser-api-user-info'
import { RefundDispenserForm } from './refund-dispenser-form'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { Loader2 as Loader } from 'lucide-react'
import { useLoadableActiveWalletAccountSnapshotAtom } from '@/features/wallet/data/active-wallet'
import { PageLoader } from '@/features/common/components/page-loader'

type Props = {
  networkConfig: NetworkConfigWithId
}

export function DispenserApiLoggedIn({ networkConfig }: Props) {
  invariant(networkConfig.dispenserApi?.url, 'Dispenser API URL is not configured')
  const { fundLimit, fundAccount, refundStatus, refundDispenserAccount } = useDispenserApi(networkConfig.dispenserApi)
  const loadableActiveWalletAccountSnapshot = useLoadableActiveWalletAccountSnapshotAtom()

  return (
    <RenderLoadable loadable={loadableActiveWalletAccountSnapshot} fallback={<PageLoader />}>
      {(activeWalletAccountSnapshot) => (
        <div className="flex flex-col gap-4 overflow-hidden xl:w-1/2">
          <DispenserApiUserInfo />
          <Accordion type="single" collapsible defaultValue="fund">
            <AccordionItem value="fund">
              <AccordionTrigger>Fund an existing {networkConfig.name} account</AccordionTrigger>
              <AccordionContent>
                <FundAccountForm onSubmit={fundAccount} limit={fundLimit} defaultReceiver={activeWalletAccountSnapshot?.address} />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="refund">
              <AccordionTrigger>Refund unused {networkConfig.name} ALGO</AccordionTrigger>
              <AccordionContent>
                <RenderLoadable
                  loadable={refundStatus}
                  fallback={
                    <div className="mt-4 flex flex-col items-center justify-center">
                      <Loader className="size-10 animate-spin" />
                    </div>
                  }
                >
                  {(refundStatus) => {
                    if (refundStatus.canRefund) {
                      return <RefundDispenserForm onSubmit={refundDispenserAccount} limit={refundStatus.limit} />
                    }
                    return <p>This action requires a connected wallet</p>
                  }}
                </RenderLoadable>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </RenderLoadable>
  )
}
