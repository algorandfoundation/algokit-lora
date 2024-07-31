import { useCallback } from 'react'
import { toast } from 'react-toastify'
import { Button } from '@/features/common/components/button'
import { algos } from '@algorandfoundation/algokit-utils'
import { kmd } from '@/features/common/data/algo-client'
import { fundLocalnetAccount } from './fund-localnet-address-form'
import { PROVIDER_ID, useWallet } from '@txnlab/use-wallet'

// TODO: NC - Move these types and functions elsewhere
type Wallet = {
  id: string
  name: string
}

type GenerateKeyResponse = {
  address?: string
}

const loraKmdDevWalletName = 'lora-dev-wallet'
const getOrCreateLoraKmdDevWallet = async () => {
  const listResponse = (await kmd!.listWallets()) as { wallets: Wallet[] }
  const wallet = listResponse.wallets.find((w: { name: string }) => w.name === loraKmdDevWalletName)
  // TODO: NC - Can we have 2 wallets with the same name. Do we care, just add to the first?

  if (!wallet) {
    // Create the wallet
    return (await kmd!.createWallet(loraKmdDevWalletName, '')).wallet as Wallet
  }

  return wallet
}

const createLoraKmdDevAccount = async (wallet: Wallet) => {
  const walletHandle = (await kmd!.initWalletHandle(wallet.id, '')).wallet_handle_token as string | undefined
  if (!walletHandle) {
    throw new Error('Failed to connect to the lora KMD dev wallet')
  }
  const generateKeyResponse = (await kmd!.generateKey(walletHandle)) as GenerateKeyResponse
  walletHandle && (await kmd!.releaseWalletHandle(walletHandle))
  if (!generateKeyResponse.address) {
    throw new Error('Failed to create dev account in KMD')
  }

  return generateKeyResponse.address
}

export function CreateKmdDevAccountButton() {
  const { providers } = useWallet()
  const activeProvider = providers?.find((p) => p.isActive)

  const createDevAccount = useCallback(async () => {
    // TODO: NC - We need to out the address of the dev account
    // TODO: NC - Put some text around the create dev account flow

    const devAccountAddress = await createLoraKmdDevAccount(await getOrCreateLoraKmdDevWallet())
    await fundLocalnetAccount(devAccountAddress, algos(5))
    if (activeProvider && activeProvider.metadata.id === PROVIDER_ID.KMD) {
      await activeProvider?.connect()
    }
    toast.success(`Dev account created with address ${devAccountAddress}`)
  }, [activeProvider])

  return <Button onClick={createDevAccount}>Create KMD Dev Account</Button>
}
