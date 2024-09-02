import { FundAccountForm } from './fund-account-form'
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'
import { algorandClient } from '@/features/common/data/algo-client'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/features/common/components/accordion'
import { createLoraKmdDevAccount, loraKmdDevWalletName } from '../utils/kmd'
import { PROVIDER_ID, useWallet } from '@txnlab/use-wallet'
import { useCallback, useState } from 'react'
import { Address } from '@/features/accounts/data/types'
import { AccountLink } from '@/features/accounts/components/account-link'
import { cn } from '@/features/common/utils'
import { ellipseAddress } from '@/utils/ellipse-address'
import { useLoadableActiveWalletAddressSnapshotAtom } from '@/features/wallet/data/active-wallet'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { PageLoader } from '@/features/common/components/page-loader'

const fundExistingAccountAccordionId = 'existing'
const fundNewAccountAccordionId = 'new'
export const fundExistingAccountAccordionLabel = 'Fund an existing LocalNet account'
export const fundNewAccountAccordionLabel = 'Create and fund a new LocalNet account'

const fundLocalnetAccount = async (receiver: Address, amount: AlgoAmount) => {
  const from = await algorandClient.account.kmd.getLocalNetDispenserAccount()
  await algorandClient.send.payment({
    sender: from.addr,
    signer: from,
    receiver,
    amount,
    note: 'Funded by AlgoKit lora',
  })
}

export function LocalnetFunding() {
  const { providers } = useWallet()
  const activeProvider = providers?.find((p) => p.isActive)
  const loadableActiveWalletAddressSnapshot = useLoadableActiveWalletAddressSnapshotAtom()

  const [createdAddress, setCreatedAddress] = useState<Address | undefined>(undefined)

  const createLocalnetAccount = useCallback(async () => {
    const address = await createLoraKmdDevAccount(algorandClient.client.kmd)
    if (activeProvider && activeProvider.metadata.id === PROVIDER_ID.KMD) {
      // Force connect to refresh the list of wallets and accounts available.
      await activeProvider.connect()
    }
    setCreatedAddress(address)
    return address
  }, [activeProvider])

  return (
    <RenderLoadable loadable={loadableActiveWalletAddressSnapshot} fallback={<PageLoader />}>
      {(activeWalletAddressSnapshot) => (
        <Accordion
          type="single"
          collapsible
          className="xl:w-1/2"
          defaultValue={fundExistingAccountAccordionId}
          onValueChange={() => setCreatedAddress(undefined)}
        >
          <AccordionItem value={fundExistingAccountAccordionId}>
            <AccordionTrigger>{fundExistingAccountAccordionLabel}</AccordionTrigger>
            <AccordionContent>
              <FundAccountForm onSubmit={fundLocalnetAccount} defaultReceiver={activeWalletAddressSnapshot} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value={fundNewAccountAccordionId}>
            <AccordionTrigger>{fundNewAccountAccordionLabel}</AccordionTrigger>
            <AccordionContent>
              <FundAccountForm onCreateReceiver={createLocalnetAccount} onSubmit={fundLocalnetAccount} />
              {createdAddress && (
                <p>
                  A new account&nbsp;
                  <AccountLink address={createdAddress} className={cn('text-primary underline text-sm')}>
                    <abbr className="tracking-wide" title={createdAddress}>
                      {ellipseAddress(createdAddress)}
                    </abbr>
                  </AccountLink>
                  &nbsp;was created.
                  <br />
                  You can use this account by connecting to the KMD '{loraKmdDevWalletName}' wallet and supplying an empty password.
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </RenderLoadable>
  )
}
