import { Address } from '@/features/accounts/data/types'
import { invariant } from '@/utils/invariant'
import algosdk from 'algosdk'

export type Wallet = {
  id: string
  name: string
}

type GenerateKeyResponse = {
  address?: string
}

export const loraKmdDevWalletName = 'lora-dev'

const getOrCreateLoraKmdDevWallet = async (kmd: algosdk.Kmd) => {
  const listResponse = (await kmd.listWallets()) as { wallets: Wallet[] }
  const wallet = listResponse.wallets.find((w: { name: string }) => w.name === loraKmdDevWalletName)

  if (!wallet) {
    return (await kmd.createWallet(loraKmdDevWalletName, '')).wallet as Wallet
  }

  return wallet
}

export const createLoraKmdDevAccount = async (kmd: algosdk.Kmd): Promise<Address> => {
  const wallet = await getOrCreateLoraKmdDevWallet(kmd)
  const walletHandle = (await kmd.initWalletHandle(wallet.id, '')).wallet_handle_token as string | undefined
  invariant(walletHandle, 'Failed to connect to the lora KMD dev wallet')
  const generateKeyResponse = (await kmd.generateKey(walletHandle)) as GenerateKeyResponse
  walletHandle && (await kmd.releaseWalletHandle(walletHandle))
  invariant(generateKeyResponse.address, 'Failed to create dev account in KMD')
  return generateKeyResponse.address
}
