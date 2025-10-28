import { FundAccountForm } from './fund-account-form'
import { algorandClient } from '@/features/common/data/algo-client'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/features/common/components/accordion'
import { createLoraKmdDevAccount, loraKmdDevWalletName } from '../utils/kmd'
import { WalletId, useWallet } from '@txnlab/use-wallet-react'
import { useCallback, useState } from 'react'
import { Address } from '@/features/accounts/data/types'
import { AccountLink } from '@/features/accounts/components/account-link'
import { cn } from '@/features/common/utils'
import { ellipseAddress } from '@/utils/ellipse-address'
import { useLoadableActiveWalletAccountSnapshotAtom } from '@/features/wallet/data/active-wallet'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { PageLoader } from '@/features/common/components/page-loader'
import { useLocation } from 'react-router-dom'
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'

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
  const { search } = useLocation()
  const queryParams = new URLSearchParams(search)
  const create = queryParams.get('create') === 'true'
  const activeItem = create ? fundNewAccountAccordionId : fundExistingAccountAccordionId

  const { wallets } = useWallet()
  const activeWallet = wallets?.find((p) => p.isActive)
  const loadableActiveWalletAccountSnapshot = useLoadableActiveWalletAccountSnapshotAtom()

  const [createdAddress, setCreatedAddress] = useState<Address | undefined>(undefined)

  const createLocalnetAccount = useCallback(async () => {
    const address = await createLoraKmdDevAccount(algorandClient.client.kmd)
    if (activeWallet && activeWallet.metadata.name === WalletId.KMD) {
      // Force connect to refresh the list of wallets and accounts available.
      await activeWallet.connect()
    }
    setCreatedAddress(address)
    return address
  }, [activeWallet])

  return (
    <RenderLoadable loadable={loadableActiveWalletAccountSnapshot} fallback={<PageLoader />}>
      {(activeWalletAccountSnapshot) => (
        <Accordion
          key={activeItem}
          type="single"
          collapsible
          className="xl:w-1/2"
          defaultValue={activeItem}
          onValueChange={() => setCreatedAddress(undefined)}
        >
          <AccordionItem value={fundExistingAccountAccordionId}>
            <AccordionTrigger>{fundExistingAccountAccordionLabel}</AccordionTrigger>
            <AccordionContent>
              <FundAccountForm onSubmit={fundLocalnetAccount} defaultReceiver={activeWalletAccountSnapshot?.address} />
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
                  You can use this account by connecting to the KMD '{loraKmdDevWalletName}' wallet.
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </RenderLoadable>
  )
}
