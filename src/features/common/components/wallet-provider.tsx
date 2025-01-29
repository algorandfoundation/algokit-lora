import { PropsWithChildren, useMemo } from 'react'
import { WalletProviderInner } from './wallet-provider-inner'
import { defaultKmdWallet, useSelectedKmdWallet } from '@/features/wallet/data/selected-kmd-wallet'
import { mainnetId, NetworkConfigWithId } from '@/features/network/data/types'
import { SupportedWallet, WalletId, WalletIdConfig, WalletManager } from '@txnlab/use-wallet-react'
import { DialogBodyProps, useDialogForm } from '../hooks/use-dialog-form'
import { PromptForm } from './prompt-form'
import { loraKmdDevWalletName } from '@/features/fund/utils/kmd'

type Props = PropsWithChildren<{
  networkConfig: NetworkConfigWithId
}>

const kmdWalletsWithoutAPassword = [loraKmdDevWalletName, defaultKmdWallet]

export function WalletProvider({ networkConfig, children }: Props) {
  const selectedKmdWallet = useSelectedKmdWallet()
  const { open: openKmdPasswordDialog, dialog: kmdPasswordDialog } = useDialogForm({
    dialogHeader: 'Connect KMD Wallet',
    dialogBody: (props: DialogBodyProps<{ message: string }, string | null>) => (
      <PromptForm message={props.data?.message} type="password" onSubmit={props.onSubmit} onCancel={props.onCancel} />
    ),
  })
  const { open: openMnemonicDialog, dialog: mnemonicDialog } = useDialogForm({
    dialogHeader: 'Connect Mnemonic Wallet',
    dialogBody: (props: DialogBodyProps<{ message: string }, string | null>) => (
      <PromptForm message={props.data?.message} type="password" onSubmit={props.onSubmit} onCancel={props.onCancel} />
    ),
  })

  const key = `${networkConfig.id}-${selectedKmdWallet ?? ''}`

  const wallets = useMemo(() => {
    return networkConfig.walletIds.reduce(
      (acc, id) => {
        if (id === WalletId.KMD && networkConfig.kmd) {
          const wallet = selectedKmdWallet ?? defaultKmdWallet
          acc.push({
            id,
            options: {
              wallet,
              baseServer: networkConfig.kmd.server,
              token: networkConfig.kmd.token ?? '',
              port: String(networkConfig.kmd.port),
              promptForPassword: async () => {
                if (kmdWalletsWithoutAPassword.includes(wallet)) {
                  return ''
                }
                const password = await openKmdPasswordDialog({ message: 'Enter KMD Password' })
                if (password == null) {
                  throw new Error('No password provided')
                }
                return password
              },
            },
          } satisfies WalletIdConfig<WalletId.KMD>)
        } else if (id === WalletId.MNEMONIC) {
          acc.push({
            id,
            options: {
              promptForMnemonic: async () => {
                const passphrase = await openMnemonicDialog({ message: 'Enter 25-word mnemonic passphrase' })
                if (!passphrase) {
                  throw new Error('No passphrase provided')
                }
                return passphrase
              },
            },
          })
        } else if ([WalletId.DEFLY, WalletId.PERA, WalletId.EXODUS].includes(id)) {
          acc.push(id)
        } else if (id === WalletId.LUTE) {
          acc.push({
            id,
            options: {
              siteName: 'AlgoKit - lora',
            },
          })
        } else {
          // eslint-disable-next-line no-console
          console.error(`${id} is not a supported wallet provider`)
        }
        return acc as SupportedWallet[]
      },
      [] as unknown as SupportedWallet[]
    )
  }, [networkConfig.walletIds, networkConfig.kmd, selectedKmdWallet, openKmdPasswordDialog, openMnemonicDialog])

  const walletManager = useMemo(() => {
    return new WalletManager({
      wallets: wallets,
      defaultNetwork: networkConfig.id,
      networks: {
        [networkConfig.id]: {
          algod: {
            baseServer: networkConfig.algod.server,
            port: networkConfig.algod.port,
            token: networkConfig.algod.token ?? '',
          },
          isTestnet: networkConfig.id !== mainnetId,
        },
      },
      options: {
        resetNetwork: true,
      },
    })
  }, [networkConfig.algod.port, networkConfig.algod.server, networkConfig.algod.token, networkConfig.id, wallets])

  return (
    // The key prop is super important it governs if the provider is reinitialized
    <>
      <WalletProviderInner key={key} walletManager={walletManager}>
        {children}
      </WalletProviderInner>
      {kmdPasswordDialog}
      {mnemonicDialog}
    </>
  )
}
