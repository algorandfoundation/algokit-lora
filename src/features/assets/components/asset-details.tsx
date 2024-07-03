import { Card, CardContent } from '@/features/common/components/card'
import { DescriptionList } from '@/features/common/components/description-list'
import { useCallback, useMemo } from 'react'
import { cn } from '@/features/common/utils'
import { Asset } from '../models'
import { isDefined } from '@/utils/is-defined'
import Decimal from 'decimal.js'
import { AccountLink } from '@/features/accounts/components/account-link'
import { ZERO_ADDRESS } from '@/features/common/constants'
import {
  assetAddressesLabel,
  assetClawbackLabel,
  assetCreatorLabel,
  assetDecimalsLabel,
  assetDefaultFrozenLabel,
  assetDetailsLabel,
  assetFreezeLabel,
  assetHistoricalTransactionsTabId,
  assetHistoricalTransactionsTabLabel,
  assetIdLabel,
  assetLiveTransactionsTabId,
  assetLiveTransactionsTabLabel,
  assetManagerLabel,
  assetNameLabel,
  assetReserveLabel,
  assetTotalSupplyLabel,
  assetActivityLabel,
  assetUnitNameLabel,
  assetUrlLabel,
} from './labels'
import { Badge } from '@/features/common/components/badge'
import { AssetMedia } from './asset-media'
import { AssetTraits } from './asset-traits'
import { AssetMetadata } from './asset-metadata'
import { AssetTransactionHistory } from './asset-transaction-history'
import { AssetLiveTransactions } from './asset-live-transactions'
import { OverflowAutoTabsContent, Tabs, TabsList, TabsTrigger } from '@/features/common/components/tabs'
import { OpenJsonViewDialogButton } from '@/features/common/components/json-view-dialog-button'
import { replaceIpfsWithGatewayIfNeeded } from '../utils/replace-ipfs-with-gateway-if-needed'
import { CopyButton } from '@/features/common/components/copy-button'
import { useWallet } from '@txnlab/use-wallet'
import { AlgorandClient, getTransactionParams } from '@algorandfoundation/algokit-utils'
import { algod, indexer } from '@/features/common/data/algo-client.ts'
import algosdk from 'algosdk'
import { LoadbleButton } from '@/features/common/components/button'
import { sendTransaction } from '@algorandfoundation/algokit-utils'
import { toast } from 'react-toastify'
import { useActiveAccount } from '@/features/accounts/data/active-account'

type Props = {
  asset: Asset
}

const expandAssetJsonLevel = (level: number) => {
  return level < 2
}

export function AssetDetails({ asset }: Props) {
  const assetItems = useMemo(
    () => [
      {
        dt: assetIdLabel,
        dd: (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center overflow-hidden">
              <span className="truncate">{asset.id}</span>
              <CopyButton value={asset.id.toString()} />
            </div>
            {asset.standardsUsed.map((s, i) => (
              <Badge key={i} variant="outline">
                {s}
              </Badge>
            ))}
            <Badge variant="outline">{asset.type}</Badge>
          </div>
        ),
      },
      asset.name
        ? {
            dt: assetNameLabel,
            dd: asset.name,
          }
        : undefined,
      asset.unitName
        ? {
            dt: assetUnitNameLabel,
            dd: asset.unitName,
          }
        : undefined,
      {
        dt: assetTotalSupplyLabel,
        dd: `${new Decimal(asset.total.toString()).div(new Decimal(10).pow(asset.decimals))} ${asset.unitName ?? ''}`,
      },
      {
        dt: assetDecimalsLabel,
        dd: asset.decimals,
      },
      {
        dt: assetDefaultFrozenLabel,
        dd: asset.defaultFrozen ? 'Yes' : 'No',
      },
      asset.url
        ? {
            dt: assetUrlLabel,
            dd: (
              <a
                href={replaceIpfsWithGatewayIfNeeded(asset.url)}
                className={cn('text-primary underline')}
                rel="nofollow noopener noreferrer"
                target="_blank"
              >
                {asset.url}
              </a>
            ),
          }
        : undefined,
    ],
    [asset.id, asset.name, asset.standardsUsed, asset.type, asset.unitName, asset.total, asset.decimals, asset.defaultFrozen, asset.url]
  ).filter(isDefined)

  const assetAddresses = useMemo(
    () => [
      {
        dt: assetCreatorLabel,
        dd: <AccountLink address={asset.creator} showCopyButton={true} />,
      },
      asset.manager && asset.manager !== ZERO_ADDRESS
        ? {
            dt: assetManagerLabel,
            dd: <AccountLink address={asset.manager} showCopyButton={true} />,
          }
        : undefined,
      asset.reserve && asset.reserve !== ZERO_ADDRESS
        ? {
            dt: assetReserveLabel,
            dd: <AccountLink address={asset.reserve} showCopyButton={true} />,
          }
        : undefined,
      asset.freeze && asset.freeze !== ZERO_ADDRESS
        ? {
            dt: assetFreezeLabel,
            dd: <AccountLink address={asset.freeze} showCopyButton={true} />,
          }
        : undefined,
      asset.clawback && asset.clawback !== ZERO_ADDRESS
        ? {
            dt: assetClawbackLabel,
            dd: <AccountLink address={asset.clawback} showCopyButton={true} />,
          }
        : undefined,
    ],
    [asset.clawback, asset.creator, asset.freeze, asset.manager, asset.reserve]
  ).filter(isDefined)

  const { canOptOut, canOptIn, optIn, optOut } = useAssetOptOut(asset)

  return (
    <div className={cn('space-y-4')}>
      <div className="flex gap-2">
        <LoadbleButton onClick={optIn} disabled={!canOptIn} className={'w-28'}>
          Opt-in
        </LoadbleButton>
        <LoadbleButton disabled={!canOptOut} onClick={optOut} className={'w-28'}>
          Opt-out
        </LoadbleButton>
      </div>
      <Card aria-label={assetDetailsLabel}>
        <CardContent>
          <div className={cn('flex gap-2')}>
            <DescriptionList items={assetItems} />
            <div className="ml-auto flex flex-col gap-2">
              <OpenJsonViewDialogButton json={asset.json} expandJsonLevel={expandAssetJsonLevel} />
              <AssetMedia asset={asset} />
            </div>
          </div>
        </CardContent>
      </Card>
      {asset.id !== 0 && (
        <>
          <Card>
            <CardContent className={cn('space-y-1')}>
              <h2>{assetAddressesLabel}</h2>
              <DescriptionList items={assetAddresses} />
            </CardContent>
          </Card>

          <AssetMetadata metadata={asset.metadata} />
          <AssetTraits traits={asset.traits} />

          <Card>
            <CardContent className={cn('space-y-1')}>
              <h2>{assetActivityLabel}</h2>
              <Tabs defaultValue={assetLiveTransactionsTabId}>
                <TabsList aria-label={assetActivityLabel}>
                  <TabsTrigger className="w-56" value={assetLiveTransactionsTabId}>
                    {assetLiveTransactionsTabLabel}
                  </TabsTrigger>
                  <TabsTrigger className="w-56" value={assetHistoricalTransactionsTabId}>
                    {assetHistoricalTransactionsTabLabel}
                  </TabsTrigger>
                </TabsList>
                <OverflowAutoTabsContent value={assetLiveTransactionsTabId}>
                  <AssetLiveTransactions assetId={asset.id} />
                </OverflowAutoTabsContent>
                <OverflowAutoTabsContent value={assetHistoricalTransactionsTabId}>
                  <AssetTransactionHistory assetId={asset.id} />
                </OverflowAutoTabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

const useAssetOptOut = (asset: Asset) => {
  const { activeAccount } = useActiveAccount()
  const { signTransactions } = useWallet()

  const canOptOut = useMemo(() => {
    if (asset.id === 0) {
      return false
    }
    return activeAccount && activeAccount.assetHolding.has(asset.id) && activeAccount.assetHolding.get(asset.id)!.amount === 0
  }, [activeAccount, asset])

  const canOptIn = useMemo(() => {
    if (asset.id === 0) {
      return false
    }
    return activeAccount && !activeAccount.assetHolding.has(asset.id)
  }, [activeAccount, asset])

  const optOut = useCallback(async () => {
    if (!activeAccount) {
      return
    }
    const transaction = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: activeAccount.address,
      to: activeAccount.address,
      assetIndex: asset.id,
      amount: 0,
      rekeyTo: undefined,
      revocationTarget: undefined,
      closeRemainderTo: activeAccount.address,
      suggestedParams: await getTransactionParams(undefined, algod),
    })

    const signer = (txnGroup: algosdk.Transaction[], indexesToSign: number[]) => {
      const encodedTransactions = txnGroup.map((txn) => algosdk.encodeUnsignedTransaction(txn))
      return signTransactions(encodedTransactions, indexesToSign)
    }
    const signerAccount = {
      addr: activeAccount.address,
      signer,
    }
    try {
      const { confirmation } = await sendTransaction(
        {
          transaction,
          from: signerAccount,
        },
        algod
      )

      if (confirmation!.confirmedRound) {
        toast.success('Asset opt-out successfully')
      } else {
        // TODO: this doesn't throw on 400
        toast.error(confirmation!.poolError ? `Failed to opt-out of asset due to ${confirmation!.poolError}` : 'Failed to opt-out of asset')
      }
    } catch (error) {
      toast.error('Failed to opt-out, unknown error')
    }
  }, [activeAccount, asset.id, signTransactions])

  const optIn = useCallback(async () => {
    if (!activeAccount) {
      return
    }
    const algorandClient = AlgorandClient.fromClients({
      algod,
      indexer,
    })
    const signer = (txnGroup: algosdk.Transaction[], indexesToSign: number[]) => {
      const encodedTransactions = txnGroup.map((txn) => algosdk.encodeUnsignedTransaction(txn))
      return signTransactions(encodedTransactions, indexesToSign)
    }
    algorandClient.setDefaultSigner(signer)
    try {
      const sendResult = await algorandClient.send.assetOptIn(
        {
          assetId: BigInt(asset.id),
          sender: activeAccount.address,
        },
        {}
      )
      if (sendResult.confirmation.confirmedRound) {
        toast.success('Asset opt-in successfully')
      } else {
        toast.error(
          sendResult.confirmation.poolError
            ? `Failed to opt-in to asset due to ${sendResult.confirmation.poolError}`
            : 'Failed to opt-in to asset'
        )
      }
    } catch (error) {
      toast.error('Failed to opt-in, unknown error')
    }
  }, [activeAccount, asset.id, signTransactions])

  return {
    canOptIn,
    canOptOut,
    optIn,
    optOut,
  }
}
