import algosdk from 'algosdk'
import { DescriptionList, DescriptionListItems } from '@/features/common/components/description-list'
import {
  BuildableTransactionType,
  BuildAccountCloseTransactionResult,
  BuildAppCallTransactionResult,
  BuildAssetClawbackTransactionResult,
  BuildAssetCreateTransactionResult,
  BuildAssetDestroyTransactionResult,
  BuildAssetFreezeTransactionResult,
  BuildAssetOptInTransactionResult,
  BuildAssetOptOutTransactionResult,
  BuildAssetReconfigureTransactionResult,
  BuildAssetTransferTransactionResult,
  BuildKeyRegistrationTransactionResult,
  BuildMethodCallTransactionResult,
  BuildPaymentTransactionResult,
  BuildTransactionResult,
  MethodCallArg,
  PlaceholderTransaction,
  TransactionPositionsInGroup,
} from '../models'
import { getAbiStructValue, getAbiValue } from '@/features/abi-methods/data'
import { DecodedAbiValue } from '@/features/abi-methods/components/decoded-abi-value'
import { AssetIdLink } from '@/features/assets/components/asset-link'
import { ApplicationLink } from '@/features/applications/components/application-link'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { DecodedAbiType } from '@/features/abi-methods/models'
import { TransactionType } from '@/features/transactions/models'
import {
  asAppCallTransactionParams,
  asAssetConfigTransactionParams,
  asAssetFreezeTransactionParams,
  asAssetTransferTransactionParams,
  asKeyRegistrationTransactionParams,
  asPaymentTransactionParams,
} from './as-algosdk-transactions'
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'
import { CommonAppCallParams } from '@algorandfoundation/algokit-utils/types/composer'
import { Button } from '@/features/common/components/button'
import { invariant } from '@/utils/invariant'
import { Edit, PlusCircle } from 'lucide-react'
import { isBuildTransactionResult, isPlaceholderTransaction } from '../utils/transaction-result-narrowing'
import { asAssetDisplayAmount } from '@/features/common/components/display-asset-amount'
import { AddressOrNfdLink } from '@/features/accounts/components/address-or-nfd-link'
import { DecodedAbiStruct } from '@/features/abi-methods/components/decoded-abi-struct'
import { ArgumentDefinition } from '@/features/applications/models'

export const asDescriptionListItems = (
  transaction: BuildTransactionResult,
  transactionPositions: TransactionPositionsInGroup,
  onEditTransaction: (transaction: BuildTransactionResult | PlaceholderTransaction) => Promise<void>
): DescriptionListItems => {
  if (transaction.type === BuildableTransactionType.Payment || transaction.type === BuildableTransactionType.AccountClose) {
    return asPaymentTransaction(transaction)
  }
  if (transaction.type === BuildableTransactionType.AppCall) {
    return asAppCallTransaction(transaction)
  }
  if (transaction.type === BuildableTransactionType.MethodCall) {
    return asMethodCallTransaction(transaction, transactionPositions, onEditTransaction)
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
  if (transaction.type === BuildableTransactionType.AssetFreeze) {
    return asAssetFreezeTransaction(transaction)
  }
  if (transaction.type === BuildableTransactionType.KeyRegistration) {
    return asKeyRegistrationTransaction(transaction)
  }

  throw new Error('Unsupported transaction type')
}

const asPaymentTransaction = (txn: BuildPaymentTransactionResult | BuildAccountCloseTransactionResult): DescriptionListItems => {
  const params = asPaymentTransactionParams(txn)

  return [
    {
      dt: 'Sender',
      dd: <AddressOrNfdLink address={params.sender} />,
    },
    ...('closeRemainderTo' in params && params.closeRemainderTo
      ? [
          {
            dt: 'Close remainder to',
            dd: <AddressOrNfdLink address={params.closeRemainderTo} />,
          },
        ]
      : []),
    {
      dt: 'Receiver',
      dd: <AddressOrNfdLink address={params.receiver} />,
    },
    {
      dt: 'Amount',
      dd: <DisplayAlgo amount={params.amount} />,
    },
    ...asFeeItem(params.staticFee),
    ...asValidRoundsItem(params.firstValidRound, params.lastValidRound),
    ...asNoteItem(params.note),
  ]
}

const asAssetTransferTransaction = (
  transaction:
    | BuildAssetTransferTransactionResult
    | BuildAssetOptInTransactionResult
    | BuildAssetOptOutTransactionResult
    | BuildAssetClawbackTransactionResult
): DescriptionListItems => {
  const params = asAssetTransferTransactionParams(transaction)

  return [
    {
      dt: 'Asset ID',
      dd: <AssetIdLink assetId={Number(params.assetId)} />,
    },
    {
      dt: 'Sender',
      dd: <AddressOrNfdLink address={params.sender} />,
    },
    {
      dt: 'Receiver',
      dd: <AddressOrNfdLink address={params.receiver} />,
    },
    ...('clawbackTarget' in params && params.clawbackTarget
      ? [
          {
            dt: 'Clawback target',
            dd: <AddressOrNfdLink address={params.clawbackTarget} />,
          },
        ]
      : []),
    ...('closeAssetTo' in params && params.closeAssetTo
      ? [
          {
            dt: 'Close remainder to',
            dd: <AddressOrNfdLink address={params.closeAssetTo} />,
          },
        ]
      : []),
    {
      dt: 'Amount',
      dd: `${asAssetDisplayAmount(params.amount, transaction.asset.decimals!)}${transaction.asset.unitName ? ` ${transaction.asset.unitName}` : ''}`,
    },
    ...asFeeItem(params.staticFee),
    ...asValidRoundsItem(params.firstValidRound, params.lastValidRound),
    ...asNoteItem(params.note),
  ]
}

const asAssetConfigTransaction = (
  transaction: BuildAssetCreateTransactionResult | BuildAssetReconfigureTransactionResult | BuildAssetDestroyTransactionResult
): DescriptionListItems => {
  const params = asAssetConfigTransactionParams(transaction)

  return [
    ...('assetId' in params && params.assetId
      ? [
          {
            dt: 'Asset ID',
            dd: <AssetIdLink assetId={Number(params.assetId)} />,
          },
        ]
      : []),
    ...('assetName' in params && params.assetName ? [{ dt: 'Asset name', dd: params.assetName }] : []),
    ...('unitName' in params && params.unitName ? [{ dt: 'Unit name', dd: params.unitName }] : []),
    ...('total' in params && params.total ? [{ dt: 'Total', dd: params.total }] : []),
    ...('decimals' in params && params.decimals !== undefined ? [{ dt: 'Decimals', dd: params.decimals }] : []),
    {
      dt: transaction.type === BuildableTransactionType.AssetCreate ? 'Creator' : 'Sender',
      dd: <AddressOrNfdLink address={params.sender} />,
    },
    ...('manager' in params && params.manager
      ? [
          {
            dt: 'Manager',
            dd: <AddressOrNfdLink address={params.manager} />,
          },
        ]
      : []),
    ...('reserve' in params && params.reserve
      ? [
          {
            dt: 'Reserve',
            dd: <AddressOrNfdLink address={params.reserve} />,
          },
        ]
      : []),
    ...('freeze' in params && params.freeze
      ? [
          {
            dt: 'Freeze',
            dd: <AddressOrNfdLink address={params.freeze} />,
          },
        ]
      : []),
    ...('clawback' in params && params.clawback
      ? [
          {
            dt: 'Clawback',
            dd: <AddressOrNfdLink address={params.clawback} />,
          },
        ]
      : []),
    ...('defaultFrozen' in params && params.defaultFrozen ? [{ dt: 'Freeze by default', dd: params.defaultFrozen.toString() }] : []),
    ...('url' in params && params.url ? [{ dt: 'URL', dd: params.url }] : []),
    ...('metadataHash' in transaction && transaction.metadataHash
      ? [{ dt: 'Metadata hash', dd: transaction.metadataHash.toString() }]
      : []),
    ...asFeeItem(params.staticFee),
    ...asValidRoundsItem(params.firstValidRound, params.lastValidRound),
    ...asNoteItem(params.note),
  ]
}

const asAssetFreezeTransaction = (transaction: BuildAssetFreezeTransactionResult): DescriptionListItems => {
  const params = asAssetFreezeTransactionParams(transaction)

  return [
    {
      dt: 'Asset ID',
      dd: <AssetIdLink assetId={Number(params.assetId)} />,
    },
    {
      dt: 'Sender',
      dd: <AddressOrNfdLink address={params.sender} />,
    },
    ...('account' in params && params.account
      ? [
          {
            dt: 'Freeze target',
            dd: <AddressOrNfdLink address={params.account} />,
          },
        ]
      : []),
    {
      dt: 'Action',
      dd: params.frozen ? freezeAssetLabel : unfreezeAssetLabel,
    },
    ...asFeeItem(params.staticFee),
    ...asValidRoundsItem(params.firstValidRound, params.lastValidRound),
    ...asNoteItem(params.note),
  ]
}

const asKeyRegistrationTransaction = (transaction: BuildKeyRegistrationTransactionResult): DescriptionListItems => {
  const params = asKeyRegistrationTransactionParams(transaction)

  return [
    {
      dt: 'Sender',
      dd: <AddressOrNfdLink address={params.sender} />,
    },
    {
      dt: 'Registration',
      dd: transaction.online ? onlineKeyRegistrationLabel : offlineKeyRegistrationLabel,
    },
    ...(params.voteKey ? [{ dt: 'Voting key', dd: Buffer.from(params.voteKey).toString('base64') }] : []),
    ...(params.selectionKey ? [{ dt: 'Selection key', dd: Buffer.from(params.selectionKey).toString('base64') }] : []),
    ...(params.stateProofKey ? [{ dt: 'State proof key', dd: Buffer.from(params.stateProofKey).toString('base64') }] : []),
    ...(params.voteFirst ? [{ dt: 'First voting round', dd: params.voteFirst }] : []),
    ...(params.voteLast ? [{ dt: 'Last voting round', dd: params.voteLast }] : []),
    ...(params.voteKeyDilution ? [{ dt: 'Vote key dilution', dd: params.voteKeyDilution }] : []),
    ...asFeeItem(params.staticFee),
    ...asValidRoundsItem(params.firstValidRound, params.lastValidRound),
    ...asNoteItem(params.note),
  ]
}

const flatten = (args: MethodCallArg[]): MethodCallArg[] => {
  return args.reduce((acc, arg) => {
    if (typeof arg === 'object' && 'type' in arg && arg.type === BuildableTransactionType.MethodCall) {
      return [...acc, ...flatten(arg.methodArgs), arg]
    }
    return [...acc, arg]
  }, [] as MethodCallArg[])
}

const asMethodArg = (
  argumentDefinition: ArgumentDefinition,
  argIndex: number,
  args: MethodCallArg[],
  transactionPositions: TransactionPositionsInGroup,
  onEditTransaction: (transaction: BuildTransactionResult | PlaceholderTransaction) => Promise<void>
) => {
  const arg = args[argIndex]
  if (algosdk.abiTypeIsTransaction(argumentDefinition.type)) {
    invariant(typeof arg === 'object' && 'type' in arg, 'Transaction type args must be a transaction')

    const argId = arg.type === BuildableTransactionType.Fulfilled ? arg.fulfilledById : arg.id
    const resolvedArg =
      arg.id !== argId
        ? flatten(args)
            .filter((arg) => isBuildTransactionResult(arg) || isPlaceholderTransaction(arg))
            .find((a) => a.id === argId)
        : arg
    const argPosition = transactionPositions.get(argId)

    // Transaction type args are shown in the table
    return (
      <div className="float-left flex items-center gap-1.5">
        <span className="truncate">Transaction {argPosition ?? ''} in the group</span>
        {resolvedArg && resolvedArg.type !== BuildableTransactionType.Fulfilled && (
          <Button
            className="size-4 p-0 text-primary"
            variant="no-style"
            onClick={() => onEditTransaction(resolvedArg)}
            {...(resolvedArg.type === BuildableTransactionType.Placeholder
              ? { icon: <PlusCircle size={16} />, 'aria-label': 'Create' }
              : { icon: <Edit size={16} />, 'aria-label': 'Edit' })}
          />
        )}
      </div>
    )
  }
  if (algosdk.abiTypeIsReference(argumentDefinition.type)) {
    if (argumentDefinition.type === algosdk.ABIReferenceType.account) {
      return <AddressOrNfdLink address={arg.toString()} />
    }
    if (argumentDefinition.type === algosdk.ABIReferenceType.asset) {
      const assetId = Number(arg)
      return <AssetIdLink assetId={assetId} />
    }
    if (argumentDefinition.type === algosdk.ABIReferenceType.application) {
      const applicationId = Number(arg)
      return <ApplicationLink applicationId={applicationId} />
    }
    return arg.toString()
  }
  if (arg === undefined) {
    return 'Not set'
  }
  if (argumentDefinition.struct) {
    const structModel = getAbiStructValue(argumentDefinition.struct, arg as algosdk.ABIValue)
    return <DecodedAbiStruct struct={structModel} />
  }

  const abiValue = getAbiValue(argumentDefinition.type, arg as algosdk.ABIValue)
  return <DecodedAbiValue abiValue={abiValue} />
}

const asAppCallTransaction = (transaction: BuildAppCallTransactionResult): DescriptionListItems => {
  const params = asAppCallTransactionParams(transaction)

  return [
    ...(params.appId !== 0n
      ? [
          {
            dt: 'Application ID',
            dd: <ApplicationLink applicationId={Number(params.appId)} />,
          },
        ]
      : []),
    {
      dt: 'On complete',
      dd: asOnCompleteLabel(params.onComplete ?? algosdk.OnApplicationComplete.NoOpOC),
    },
    {
      dt: 'Sender',
      dd: <AddressOrNfdLink address={params.sender} />,
    },
    ...(transaction.args.length > 0
      ? [
          {
            dt: 'Arguments',
            dd: <DescriptionList items={transaction.args.map((arg, index) => ({ dt: `Arg ${index + 1}`, dd: arg }))} />,
          },
        ]
      : []),
    ...asFeeItem(params.staticFee),
    ...asValidRoundsItem(params.firstValidRound, params.lastValidRound),
    ...asNoteItem(params.note),
    ...asResourcesItem(params.accountReferences, params.assetReferences, params.appReferences, params.boxReferences),
  ]
}

const asMethodCallTransaction = (
  transaction: BuildMethodCallTransactionResult,
  transactionPositions: TransactionPositionsInGroup,
  onEditTransaction: (transaction: BuildTransactionResult | PlaceholderTransaction) => Promise<void>
): DescriptionListItems => {
  // Done to share the majority of the mappings with app call
  const params = asAppCallTransactionParams({
    ...transaction,
    type: BuildableTransactionType.AppCall,
    args: [],
  })

  return [
    ...(params.appId !== 0n
      ? [
          {
            dt: 'Application ID',
            dd: <ApplicationLink applicationId={Number(params.appId)} />,
          },
        ]
      : []),
    ...(transaction.methodDefinition ? [{ dt: 'Method', dd: transaction.methodDefinition.name }] : []),
    {
      dt: 'On complete',
      dd: asOnCompleteLabel(params.onComplete ?? algosdk.OnApplicationComplete.NoOpOC),
    },
    {
      dt: 'Sender',
      dd: <AddressOrNfdLink address={params.sender} />,
    },
    ...(transaction.methodDefinition.arguments.length > 0
      ? [
          {
            dt: 'Arguments',
            dd: (
              <ol>
                {transaction.methodDefinition.arguments.map((arg, index) => (
                  <li key={index} className="truncate">
                    <span className="float-left mr-1.5">{arg.name ? arg.name : `Arg ${index + 1}`}: </span>
                    {asMethodArg(arg, index, transaction.methodArgs!, transactionPositions, onEditTransaction)}
                  </li>
                ))}
              </ol>
            ),
          },
        ]
      : []),
    ...asFeeItem(params.staticFee),
    ...asValidRoundsItem(params.firstValidRound, params.lastValidRound),
    ...asNoteItem(params.note),
    ...asResourcesItem(params.accountReferences, params.assetReferences, params.appReferences, params.boxReferences),
  ]
}

const asNoteItem = (note?: string | Uint8Array) =>
  note && typeof note === 'string'
    ? [
        {
          dt: 'Note',
          dd: note,
        },
      ]
    : []

const asFeeItem = (fee?: AlgoAmount) => (fee ? [{ dt: 'Fee', dd: <DisplayAlgo amount={fee} /> }] : [])

const asValidRoundsItem = (firstValid?: bigint, lastValid?: bigint) =>
  firstValid && lastValid
    ? [
        {
          dt: 'Valid rounds',
          dd: `${firstValid} - ${lastValid}`,
        },
      ]
    : []

const asResourcesItem = (accounts?: string[], assets?: bigint[], apps?: bigint[], boxes?: CommonAppCallParams['boxReferences']) => {
  return [
    {
      dt: 'Resources',
      dd: (
        <ul>
          <li>
            <span className="mr-1">accounts:</span>
            <>
              <span>[</span>
              {accounts && accounts.length > 0 && (
                <ol className="pl-4">
                  {accounts?.map((address, index, array) => (
                    <li key={index} className="truncate">
                      <AddressOrNfdLink address={address} className="inline text-primary underline">
                        {address}
                      </AddressOrNfdLink>
                      {index < array.length - 1 ? <span>{', '}</span> : null}
                    </li>
                  ))}
                </ol>
              )}
              <span>]</span>
            </>
          </li>
          <li>
            <span className="mr-1">assets:</span>
            <>
              <span>[</span>
              {assets && assets.length > 0 && (
                <ol className="pl-4">
                  {assets.map((assetId, index, array) => (
                    <li key={index} className="truncate">
                      <AssetIdLink assetId={Number(assetId)} className="inline text-primary underline">
                        {Number(assetId)}
                      </AssetIdLink>
                      {index < array.length - 1 ? <span>{', '}</span> : null}
                    </li>
                  ))}
                </ol>
              )}
              <span>]</span>
            </>
          </li>
          <li>
            <span className="mr-1">applications:</span>
            <>
              <span>[</span>
              {apps && apps.length > 0 && (
                <ol className="pl-4">
                  {apps?.map((appId, index, array) => (
                    <li key={index} className="truncate">
                      <ApplicationLink applicationId={Number(appId)} className="inline text-primary underline">
                        {Number(appId)}
                      </ApplicationLink>
                      {index < array.length - 1 ? <span>{', '}</span> : null}
                    </li>
                  ))}
                </ol>
              )}
              <span>]</span>
            </>
          </li>
          <li>
            <span className="mr-1">boxes:</span>
            <>
              <span>[</span>
              {boxes && boxes.length > 0 && (
                <ol className="pl-4">
                  {boxes?.map((box, index, array) => {
                    if (typeof box === 'object' && 'appId' in box && typeof box.name !== 'string' && !('addr' in box.name)) {
                      const encodedBoxName = Buffer.from(box.name).toString('base64')
                      return (
                        <li key={index} className="truncate">
                          <span>[</span>
                          {box.appId > 0 ? (
                            <ApplicationLink applicationId={Number(box.appId)} className="inline text-primary underline">
                              {Number(box.appId)}
                            </ApplicationLink>
                          ) : (
                            <DecodedAbiValue
                              abiValue={{
                                type: DecodedAbiType.Uint,
                                value: 0n,
                                multiline: false,
                                length: 1,
                              }}
                            />
                          )}
                          <span>{', '}</span>
                          <DecodedAbiValue
                            abiValue={{
                              type: DecodedAbiType.String,
                              value: encodedBoxName,
                              multiline: false,
                              length: encodedBoxName.length,
                            }}
                          />
                          <span>]</span>
                          {index < array.length - 1 ? <span>{', '}</span> : null}
                        </li>
                      )
                    }
                    return (
                      <li key={index} className="truncate">
                        unknown
                      </li>
                    )
                  })}
                </ol>
              )}
              <span>]</span>
            </>
          </li>
        </ul>
      ),
    },
  ]
}

export const asOnCompleteLabel = (onComplete: algosdk.OnApplicationComplete) => {
  switch (onComplete) {
    case algosdk.OnApplicationComplete.NoOpOC:
      return 'Call (NoOp)'
    case algosdk.OnApplicationComplete.OptInOC:
      return 'Opt-in'
    case algosdk.OnApplicationComplete.CloseOutOC:
      return 'Close-out'
    case algosdk.OnApplicationComplete.ClearStateOC:
      return 'Clear state'
    case algosdk.OnApplicationComplete.UpdateApplicationOC:
      return 'Update'
    case algosdk.OnApplicationComplete.DeleteApplicationOC:
      return 'Delete'
  }
}

export const asTransactionLabelFromTransactionType = (type: algosdk.ABITransactionType) => {
  switch (type) {
    case algosdk.ABITransactionType.pay:
      return BuildableTransactionType.Payment
    case algosdk.ABITransactionType.appl:
      return TransactionType.AppCall
    case algosdk.ABITransactionType.axfer:
      return TransactionType.AssetFreeze
    case algosdk.ABITransactionType.acfg:
      return TransactionType.AssetConfig
    case algosdk.ABITransactionType.afrz:
      return TransactionType.AssetFreeze
    case algosdk.ABITransactionType.keyreg:
      return TransactionType.KeyReg
    default:
      return 'Transaction'
  }
}

export const asTransactionLabelFromBuildableTransactionType = (type: BuildableTransactionType) => {
  switch (type) {
    case BuildableTransactionType.Payment:
    case BuildableTransactionType.AccountClose:
      return TransactionType.Payment
    case BuildableTransactionType.AppCall:
    case BuildableTransactionType.MethodCall:
      return TransactionType.AppCall
    case BuildableTransactionType.AssetOptIn:
    case BuildableTransactionType.AssetOptOut:
    case BuildableTransactionType.AssetTransfer:
    case BuildableTransactionType.AssetClawback:
      return TransactionType.AssetTransfer
    case BuildableTransactionType.AssetCreate:
    case BuildableTransactionType.AssetReconfigure:
    case BuildableTransactionType.AssetDestroy:
      return TransactionType.AssetConfig
    case BuildableTransactionType.AssetFreeze:
      return TransactionType.AssetFreeze
    case BuildableTransactionType.KeyRegistration:
      return TransactionType.KeyReg
    default:
      return 'Transaction'
  }
}

export const freezeAssetLabel = 'Freeze asset'
export const unfreezeAssetLabel = 'Unfreeze asset'
export const onlineKeyRegistrationLabel = 'Online'
export const offlineKeyRegistrationLabel = 'Offline'
