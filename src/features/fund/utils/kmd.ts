import { Address } from '@/features/accounts/data/types'
import { invariant } from '@/utils/invariant'
import { KmdClient } from '@algorandfoundation/algokit-utils/kmd-client'

export type Wallet = {
  id: string
  name: string
}

export const loraKmdDevWalletName = 'lora-dev'

const getOrCreateLoraKmdDevWallet = async (kmd: KmdClient) => {
  const listResponse = await kmd.listWallets()
  const wallet = listResponse.wallets?.find((w) => w.name === loraKmdDevWalletName)

  if (!wallet) {
    return (await kmd.createWallet({ walletName: loraKmdDevWalletName, walletPassword: '' })).wallet
  }

  return wallet
}

export const createLoraKmdDevAccount = async (kmd: KmdClient): Promise<Address> => {
  const wallet = await getOrCreateLoraKmdDevWallet(kmd)
  const walletHandle = (await kmd.initWalletHandle({ walletId: wallet.id, walletPassword: '' })).walletHandleToken
  invariant(walletHandle, 'Failed to connect to the lora KMD dev wallet')
  const generateKeyResponse = await kmd.generateKey({ walletHandleToken: walletHandle })
  if (walletHandle) {
    await kmd.releaseWalletHandleToken({ walletHandleToken: walletHandle })
  }
  invariant(generateKeyResponse.address, 'Failed to create dev account in KMD')
  return generateKeyResponse.address.toString()
}
