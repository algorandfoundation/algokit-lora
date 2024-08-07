import { FundAccountForm } from './fund-account-form'
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'
import { algod, indexer, kmd } from '@/features/common/data/algo-client'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/features/common/components/accordion'
import { createLoraKmdDevAccount, loraKmdDevWalletName } from '../utils/kmd'
import { PROVIDER_ID, useWallet } from '@txnlab/use-wallet'
import { useCallback, useState } from 'react'
import { Address } from '@/features/accounts/data/types'
import { AccountLink } from '@/features/accounts/components/account-link'
import { cn } from '@/features/common/utils'
import { ellipseAddress } from '@/utils/ellipse-address'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { invariant } from '@/utils/invariant'

const fundExistingAccountAccordionId = 'existing'
const fundNewAccountAccordionId = 'new'

const fundLocalnetAccount = async (receiver: Address, amount: AlgoAmount) => {
  invariant(kmd, 'KMD client is required')
  const algorandClient = AlgorandClient.fromClients({ algod, indexer, kmd })
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

  const [createdAddress, setCreatedAddress] = useState<Address | undefined>(undefined)

  const createLocalnetAccount = useCallback(async () => {
    invariant(kmd, 'KMD client is required')
    const address = await createLoraKmdDevAccount(kmd)
    if (activeProvider && activeProvider.metadata.id === PROVIDER_ID.KMD) {
      // Force connect to refresh the list of wallets and accounts available.
      await activeProvider.connect()
    }
    setCreatedAddress(address)
    return address
  }, [activeProvider])

  return (
    <Accordion
      type="single"
      collapsible
      className="xl:w-1/2"
      defaultValue={fundExistingAccountAccordionId}
      onValueChange={() => setCreatedAddress(undefined)}
    >
      <AccordionItem value={fundExistingAccountAccordionId}>
        <AccordionTrigger>Fund an existing LocalNet account</AccordionTrigger>
        <AccordionContent>
          <FundAccountForm onFund={fundLocalnetAccount} />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value={fundNewAccountAccordionId}>
        <AccordionTrigger>Create and fund a new LocalNet account</AccordionTrigger>
        <AccordionContent>
          <FundAccountForm onCreateReceiver={createLocalnetAccount} onFund={fundLocalnetAccount} />
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
  )
}
