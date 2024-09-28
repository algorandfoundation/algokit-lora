import algosdk from 'algosdk'
import { DescriptionList, DescriptionListItems } from '@/features/common/components/description-list'
import {
  BuildableTransactionType,
  BuildAccountCloseTransactionResult,
  BuildAppCallTransactionResult,
  BuildAssetClawbackTransactionResult,
  BuildAssetCreateTransactionResult,
  BuildAssetDestroyTransactionResult,
  BuildAssetOptInTransactionResult,
  BuildAssetOptOutTransactionResult,
  BuildAssetReconfigureTransactionResult,
  BuildAssetTransferTransactionResult,
  BuildMethodCallTransactionResult,
  BuildPaymentTransactionResult,
  BuildTransactionResult,
  MethodCallArg,
} from '../models'
import { getAbiValue } from '@/features/abi-methods/data'
import { AbiValue } from '@/features/abi-methods/components/abi-value'
import { AccountLink } from '@/features/accounts/components/account-link'
import { AssetIdLink } from '@/features/assets/components/asset-link'
import { ApplicationLink } from '@/features/applications/components/application-link'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { algo } from '@algorandfoundation/algokit-utils'
import { AbiArrayValue } from '@/features/abi-methods/components/abi-array-value'
import { AbiType } from '@/features/abi-methods/models'

// TODO: NC - UX TODOs
// - Resources
// - Automatic sender population
// - Disable populate resources button if no app calls
// - Disable send if there are no transactions
// - Transaction type labels (+ align the move icon, make the target bigger)
// - Adjust UI for tweaking the populated resources
// - re-order does weird things with the row borders
// - resource populate dialog, do asset/application look to ensure valid
// - lookup application to ensure valid when calling a method or making an app call.

export const asDescriptionListItems = (transaction: BuildTransactionResult): DescriptionListItems => {
  if (transaction.type === BuildableTransactionType.Payment || transaction.type === BuildableTransactionType.AccountClose) {
    return asPaymentTransaction(transaction)
  }
  if (transaction.type === BuildableTransactionType.AppCall) {
    return asAppCallTransaction(transaction)
  }
  if (transaction.type === BuildableTransactionType.MethodCall) {
    return asMethodCallTransaction(transaction)
  }
  if (
    transaction.type === BuildableTransactionType.AssetTransfer ||
    transaction.type === BuildableTransactionType.AssetOptIn ||
    transaction.type === BuildableTransactionType.AssetOptOut ||
    transaction.type === BuildableTransactionType.AssetClawback
  ) {
    return asAssetTransferTransaction(transaction)
  }
  if (
    transaction.type === BuildableTransactionType.AssetCreate ||
    transaction.type === BuildableTransactionType.AssetReconfigure ||
    transaction.type === BuildableTransactionType.AssetDestroy
  ) {
    return asAssetConfigTransaction(transaction)
  }
  throw new Error('Unsupported transaction type')
}

const asPaymentTransaction = (transaction: BuildPaymentTransactionResult | BuildAccountCloseTransactionResult): DescriptionListItems => {
  return [
    {
      dt: 'Sender',
      dd: (
        <AccountLink className="text-primary underline" address={transaction.sender}>
          {transaction.sender}
        </AccountLink>
      ),
    },
    ...(transaction.receiver
      ? [
          {
            dt: 'Receiver',
            dd: (
              <AccountLink className="text-primary underline" address={transaction.receiver}>
                {transaction.receiver}
              </AccountLink>
            ),
          },
        ]
      : []),
    ...('closeRemainderTo' in transaction && transaction.closeRemainderTo
      ? [
          {
            dt: 'Close remainder to',
            dd: (
              <AccountLink className="text-primary underline" address={transaction.closeRemainderTo}>
                {transaction.closeRemainderTo}
              </AccountLink>
            ),
          },
        ]
      : []),
    ...(transaction.amount ? [{ dt: 'Amount', dd: <DisplayAlgo amount={algo(transaction.amount)} /> }] : []),
    ...asNoteItem(transaction.note),
    ...asFeeItem(transaction.fee),
    ...asValidRoundsItem(transaction.validRounds),
  ]
}

const asAssetTransferTransaction = (
  transaction:
    | BuildAssetTransferTransactionResult
    | BuildAssetOptInTransactionResult
    | BuildAssetOptOutTransactionResult
    | BuildAssetClawbackTransactionResult
): DescriptionListItems => {
  return [
    {
      dt: 'Sender',
      dd: (
        <AccountLink className="text-primary underline" address={transaction.sender}>
          {transaction.sender}
        </AccountLink>
      ),
    },
    ...('receiver' in transaction && transaction.receiver
      ? [
          {
            dt: 'Receiver',
            dd: (
              <AccountLink className="text-primary underline" address={transaction.receiver}>
                {transaction.receiver}
              </AccountLink>
            ),
          },
        ]
      : []),
    ...('clawbackTarget' in transaction && transaction.clawbackTarget
      ? [
          {
            dt: 'Clawback target',
            dd: (
              <AccountLink className="text-primary underline" address={transaction.clawbackTarget}>
                {transaction.clawbackTarget}
              </AccountLink>
            ),
          },
        ]
      : []),
    ...('closeRemainderTo' in transaction && transaction.closeRemainderTo
      ? [
          {
            dt: 'Close remainder to',
            dd: (
              <AccountLink className="text-primary underline" address={transaction.closeRemainderTo}>
                {transaction.closeRemainderTo}
              </AccountLink>
            ),
          },
        ]
      : []),
    {
      dt: 'Asset ID',
      dd: (
        <AssetIdLink className="text-primary underline" assetId={transaction.asset.id}>
          {transaction.asset.id}
        </AssetIdLink>
      ),
    },
    ...('amount' in transaction && transaction.amount
      ? [{ dt: 'Amount', dd: `${transaction.amount}${transaction.asset.unitName ? ` ${transaction.asset.unitName}` : ''}` }]
      : []),
    ...asNoteItem(transaction.note),
    ...asFeeItem(transaction.fee),
    ...asValidRoundsItem(transaction.validRounds),
  ]
}

const asAssetConfigTransaction = (
  transaction: BuildAssetCreateTransactionResult | BuildAssetReconfigureTransactionResult | BuildAssetDestroyTransactionResult
): DescriptionListItems => {
  return [
    ...('asset' in transaction && transaction.asset.id
      ? [
          {
            dt: 'Asset ID',
            dd: (
              <AssetIdLink className="text-primary underline" assetId={transaction.asset.id}>
                {transaction.asset.id}
              </AssetIdLink>
            ),
          },
        ]
      : []),
    ...('assetName' in transaction && transaction.assetName ? [{ dt: 'Asset name', dd: transaction.assetName }] : []),
    ...('unitName' in transaction && transaction.unitName ? [{ dt: 'Unit name', dd: transaction.unitName }] : []),
    ...('total' in transaction && transaction.total ? [{ dt: 'Total', dd: transaction.total }] : []),
    ...('decimals' in transaction && transaction.decimals ? [{ dt: 'Decimals', dd: transaction.decimals }] : []),
    ...('sender' in transaction && transaction.sender
      ? [
          {
            dt: transaction.type === BuildableTransactionType.AssetCreate ? 'Creator' : 'Sender',
            dd: (
              <AccountLink className="text-primary underline" address={transaction.sender}>
                {transaction.sender}
              </AccountLink>
            ),
          },
        ]
      : []),
    ...('manager' in transaction && transaction.manager
      ? [
          {
            dt: 'Manager',
            dd: (
              <AccountLink className="text-primary underline" address={transaction.manager}>
                {transaction.manager}
              </AccountLink>
            ),
          },
        ]
      : []),
    ...('reserve' in transaction && transaction.reserve
      ? [
          {
            dt: 'Reserve',
            dd: (
              <AccountLink className="text-primary underline" address={transaction.reserve}>
                {transaction.reserve}
              </AccountLink>
            ),
          },
        ]
      : []),
    ...('freeze' in transaction && transaction.freeze
      ? [
          {
            dt: 'Freeze',
            dd: (
              <AccountLink className="text-primary underline" address={transaction.freeze}>
                {transaction.freeze}
              </AccountLink>
            ),
          },
        ]
      : []),
    ...('clawback' in transaction && transaction.clawback
      ? [
          {
            dt: 'Clawback',
            dd: (
              <AccountLink className="text-primary underline" address={transaction.clawback}>
                {transaction.clawback}
              </AccountLink>
            ),
          },
        ]
      : []),
    ...('defaultFrozen' in transaction && transaction.defaultFrozen
      ? [{ dt: 'Freeze holdings of this asset by default', dd: transaction.defaultFrozen.toString() }]
      : []),
    ...('url' in transaction && transaction.url ? [{ dt: 'URL', dd: transaction.url }] : []),
    ...('metadataHash' in transaction && transaction.metadataHash ? [{ dt: 'Metadata hash', dd: transaction.metadataHash }] : []),
    ...asNoteItem(transaction.note),
    ...asFeeItem(transaction.fee),
    ...asValidRoundsItem(transaction.validRounds),
  ]
}

const asMethodArg = (type: algosdk.ABIArgumentType, arg: MethodCallArg) => {
  if (algosdk.abiTypeIsTransaction(type)) {
    // Transaction type args are shown in the table
    return 'Transaction in group'
  }
  if (algosdk.abiTypeIsReference(type)) {
    if (type === algosdk.ABIReferenceType.account) {
      return (
        <AccountLink className="text-primary underline" address={arg.toString()}>
          {arg.toString()}
        </AccountLink>
      )
    }
    if (type === algosdk.ABIReferenceType.asset) {
      const assetId = Number(arg)
      return (
        <AssetIdLink className="text-primary underline" assetId={assetId}>
          {assetId}
        </AssetIdLink>
      )
    }
    if (type === algosdk.ABIReferenceType.application) {
      const applicationId = Number(arg)
      return (
        <ApplicationLink className="text-primary underline" applicationId={applicationId}>
          {applicationId}
        </ApplicationLink>
      )
    }
    return arg.toString()
  }
  if (!arg) {
    return 'Not set'
  }
  const abiValue = getAbiValue(type, arg as algosdk.ABIValue)
  return <AbiValue abiValue={abiValue} />
}

const asAppCallTransaction = (transaction: BuildAppCallTransactionResult): DescriptionListItems => {
  return [
    {
      dt: 'Sender',
      dd: (
        <AccountLink className="text-primary underline" address={transaction.sender}>
          {transaction.sender}
        </AccountLink>
      ),
    },
    {
      dt: 'Application ID',
      dd: (
        <ApplicationLink className="text-primary underline" applicationId={transaction.applicationId}>
          {transaction.applicationId}
        </ApplicationLink>
      ),
    },
    {
      dt: 'Arguments',
      dd: <DescriptionList items={transaction.args.map((arg, index) => ({ dt: `Arg ${index}`, dd: arg }))} />,
    },
    {
      dt: 'On Complete',
      dd: asString(transaction.onComplete),
    },
    ...asNoteItem(transaction.note),
    ...asFeeItem(transaction.fee),
    ...asValidRoundsItem(transaction.validRounds),
    ...asResourcesItem(transaction),
  ]
}

const asMethodCallTransaction = (transaction: BuildMethodCallTransactionResult): DescriptionListItems => {
  return [
    {
      dt: 'Sender',
      dd: (
        <AccountLink className="text-primary underline" address={transaction.sender}>
          {transaction.sender}
        </AccountLink>
      ),
    },
    {
      dt: 'Application ID',
      dd: (
        <ApplicationLink className="text-primary underline" applicationId={transaction.applicationId}>
          {transaction.applicationId}
        </ApplicationLink>
      ),
    },
    ...(transaction.methodName ? [{ dt: 'Method name', dd: transaction.methodName }] : []),
    {
      dt: 'Arguments',
      dd: (
        <ol>
          {transaction.method.args.map((arg, index) => (
            <li className="truncate">
              {arg.name ? arg.name : `Arg ${index}`}: {asMethodArg(arg.type, transaction.methodArgs![index])}
            </li>
          ))}
        </ol>
      ),

      // (
      //   <span>a1: 1</span>
      //   <DescriptionList
      //     items={transaction.method.args.map((arg, index) => {
      //       return {
      //         dt: arg.name ? arg.name : `Arg ${index}`,
      //         dd: asMethodArg(arg.type, transaction.methodArgs![index]),
      //       }
      //     })}
      //   />
      // ),
    },
    ...asNoteItem(transaction.note),
    ...asFeeItem(transaction.fee),
    ...asValidRoundsItem(transaction.validRounds),
    ...asResourcesItem(transaction),
  ]
}

const asNoteItem = (note?: string) =>
  note
    ? [
        {
          dt: 'Note',
          dd: note,
        },
      ]
    : []

const asFeeItem = (fee: { setAutomatically: boolean; value?: number }) =>
  fee.setAutomatically === false && fee.value ? [{ dt: 'Fee', dd: <DisplayAlgo amount={algo(fee.value)} /> }] : []

const asValidRoundsItem = (validRounds: { setAutomatically: boolean; firstValid?: bigint; lastValid?: bigint }) =>
  validRounds.setAutomatically
    ? []
    : [
        {
          dt: 'Valid rounds',
          dd: `${validRounds.firstValid} - ${validRounds.lastValid}`,
        },
      ]

const asResourcesItem = (transaction: BuildAppCallTransactionResult | BuildMethodCallTransactionResult) => {
  return [
    ...(transaction.accounts
      ? [
          {
            dt: 'Accounts',
            dd: (
              <ul>
                {transaction.accounts.map((account) => (
                  <li key={account}>{account}</li>
                ))}
              </ul>
            ),
          },
        ]
      : []),
    ...(transaction.foreignAssets
      ? [
          {
            dt: 'Assets',
            dd: (
              <ul>
                {transaction.foreignAssets.map((asset) => (
                  <li key={asset}>{asset}</li>
                ))}
              </ul>
            ),
          },
        ]
      : []),
    ...(transaction.foreignApps
      ? [
          {
            dt: 'Applications',
            dd: (
              <ul>
                {transaction.foreignApps.map((app) => (
                  <li key={app}>{app}</li>
                ))}
              </ul>
            ),
          },
        ]
      : []),
    ...(transaction.boxes
      ? [
          {
            dt: 'Boxes',
            dd: (
              <ul>
                {transaction.boxes.map((box) => (
                  <li key={box}>{box}</li>
                ))}
              </ul>
            ),
          },
        ]
      : []),
  ]
}

const asString = (onComplete: algosdk.OnApplicationComplete) => {
  switch (onComplete) {
    case algosdk.OnApplicationComplete.NoOpOC:
      return 'NoOp'
    case algosdk.OnApplicationComplete.OptInOC:
      return 'Opt in'
    case algosdk.OnApplicationComplete.CloseOutOC:
      return 'Close out'
    case algosdk.OnApplicationComplete.ClearStateOC:
      return 'Clear state'
    case algosdk.OnApplicationComplete.UpdateApplicationOC:
      return 'Update'
    case algosdk.OnApplicationComplete.DeleteApplicationOC:
      return 'Delete'
  }
}
