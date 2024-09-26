import algosdk from 'algosdk'
import { DescriptionList, DescriptionListItems } from '@/features/common/components/description-list'
import {
  BuildableTransactionType,
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

export const asDescriptionListItems = (transaction: BuildTransactionResult): DescriptionListItems => {
  if (transaction.type === BuildableTransactionType.Payment) {
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

const asPaymentTransaction = (transaction: BuildPaymentTransactionResult): DescriptionListItems => {
  return [
    {
      dt: 'Sender',
      dd: transaction.sender,
    },
    {
      dt: 'Receiver',
      dd: transaction.receiver,
    },
    {
      dt: 'Amount',
      dd: transaction.amount,
    },
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
      dd: transaction.sender,
    },
    ...('receiver' in transaction ? [{ dt: 'Receiver', dd: transaction.receiver }] : []),
    ...('clawbackTarget' in transaction ? [{ dt: 'Clawback target', dd: transaction.clawbackTarget }] : []),
    ...('closeRemainderTo' in transaction ? [{ dt: 'Close remainder to', dd: transaction.closeRemainderTo }] : []),
    {
      dt: 'Asset id',
      dd: transaction.asset.id,
    },
    ...('amount' in transaction ? [{ dt: 'Amount', dd: transaction.amount }] : []),
    ...asNoteItem(transaction.note),
    ...asFeeItem(transaction.fee),
    ...asValidRoundsItem(transaction.validRounds),
  ]
}

const asAssetConfigTransaction = (
  transaction: BuildAssetCreateTransactionResult | BuildAssetReconfigureTransactionResult | BuildAssetDestroyTransactionResult
): DescriptionListItems => {
  return [
    ...('asset' in transaction && transaction.asset.id ? [{ dt: 'Asset id', dd: transaction.asset.id }] : []),
    ...('assetName' in transaction ? [{ dt: 'Asset name', dd: transaction.assetName }] : []),
    ...('unitName' in transaction ? [{ dt: 'Unit name', dd: transaction.unitName }] : []),
    ...('total' in transaction ? [{ dt: 'Total', dd: transaction.total }] : []),
    ...('decimals' in transaction ? [{ dt: 'Decimals', dd: transaction.decimals }] : []),
    ...('sender' in transaction
      ? [{ dt: transaction.type === BuildableTransactionType.AssetCreate ? 'Creator' : 'Sender', dd: transaction.sender }]
      : []),
    ...('manager' in transaction ? [{ dt: 'Manager', dd: transaction.manager }] : []),
    ...('reserve' in transaction ? [{ dt: 'Reserve', dd: transaction.reserve }] : []),
    ...('freeze' in transaction ? [{ dt: 'Freeze', dd: transaction.freeze }] : []),
    ...('clawback' in transaction ? [{ dt: 'Clawback', dd: transaction.clawback }] : []),
    ...('defaultFrozen' in transaction
      ? [{ dt: 'Freeze holdings of this asset by default', dd: transaction.defaultFrozen.toString() }]
      : []),
    ...('url' in transaction ? [{ dt: 'URL', dd: transaction.url }] : []),
    ...('metadataHash' in transaction ? [{ dt: 'Metadata hash', dd: transaction.metadataHash }] : []),
    ...asNoteItem(transaction.note),
    ...asFeeItem(transaction.fee),
    ...asValidRoundsItem(transaction.validRounds),
  ]
}

const asMethodArg = (type: algosdk.ABIArgumentType, arg: MethodCallArg) => {
  if (algosdk.abiTypeIsTransaction(type)) {
    // Transaction type args are shown in the table
    return undefined
  }
  if (algosdk.abiTypeIsReference(type)) {
    return arg.toString() // TODO: PD - check reference types
  }
  // TODO: PD - handle structs
  const abiValue = getAbiValue(type, arg as algosdk.ABIValue)
  return <AbiValue abiValue={abiValue} />
}

const asAppCallTransaction = (transaction: BuildAppCallTransactionResult): DescriptionListItems => {
  return [
    {
      dt: 'Sender',
      dd: transaction.sender,
    },
    {
      dt: 'Application ID',
      dd: transaction.applicationId,
    },
    {
      dt: 'Arguments',
      dd: <DescriptionList items={transaction.args.map((arg, index) => ({ dt: `Arg ${index}`, dd: arg }))} />,
    },
    ...asNoteItem(transaction.note),
    ...asFeeItem(transaction.fee),
    ...asValidRoundsItem(transaction.validRounds),
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

const asMethodCallTransaction = (transaction: BuildMethodCallTransactionResult): DescriptionListItems => {
  return [
    {
      dt: 'Sender',
      dd: transaction.sender,
    },
    {
      dt: 'Application ID',
      dd: transaction.applicationId,
    },
    ...(transaction.methodName ? [{ dt: 'Method name', dd: transaction.methodName }] : []),
    {
      dt: 'Arguments',
      dd: (
        <DescriptionList
          items={transaction.method.args.map((arg, index) => {
            return {
              dt: arg.name ? arg.name : `Arg ${index}`,
              dd: asMethodArg(arg.type, transaction.methodArgs![index]),
            }
          })}
        />
      ),
    },
    ...asNoteItem(transaction.note),
    ...asFeeItem(transaction.fee),
    ...asValidRoundsItem(transaction.validRounds),
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

const asNoteItem = (note?: string) =>
  note
    ? [
        {
          dt: 'Note',
          dd: note,
        },
      ]
    : []

const asFeeItem = (fee: { setAutomatically: boolean; value?: number }) => (fee.setAutomatically ? [] : [{ dt: 'Fee', dd: fee.value }])

const asValidRoundsItem = (validRounds: { setAutomatically: boolean; firstValid?: bigint; lastValid?: bigint }) =>
  validRounds.setAutomatically
    ? []
    : [
        {
          dt: 'Valid rounds',
          dd: `${validRounds.firstValid} - ${validRounds.lastValid}`,
        },
      ]
