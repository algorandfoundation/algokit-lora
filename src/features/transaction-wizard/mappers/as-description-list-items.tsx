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
import { getAbiValue } from '@/features/abi-methods/data'
import { AbiValue } from '@/features/abi-methods/components/abi-value'
import { AccountLink } from '@/features/accounts/components/account-link'
import { AssetIdLink } from '@/features/assets/components/asset-link'
import { ApplicationLink } from '@/features/applications/components/application-link'
import { DisplayAlgo } from '@/features/common/components/display-algo'
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
      dd: (
        <AccountLink className="text-primary underline" address={params.sender}>
          {params.sender}
        </AccountLink>
      ),
    },
    ...('closeRemainderTo' in params && params.closeRemainderTo
      ? [
          {
            dt: 'Close remainder to',
            dd: (
              <AccountLink className="text-primary underline" address={params.closeRemainderTo}>
                {params.closeRemainderTo}
              </AccountLink>
            ),
          },
        ]
      : []),
    {
      dt: 'Receiver',
      dd: (
        <AccountLink className="text-primary underline" address={params.receiver}>
          {params.receiver}
        </AccountLink>
      ),
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
      dd: (
        <AssetIdLink className="text-primary underline" assetId={Number(params.assetId)}>
          {Number(params.assetId)}
        </AssetIdLink>
      ),
    },
    {
      dt: 'Sender',
      dd: (
        <AccountLink className="text-primary underline" address={params.sender}>
          {params.sender}
        </AccountLink>
      ),
    },
    {
      dt: 'Receiver',
      dd: (
        <AccountLink className="text-primary underline" address={params.receiver}>
          {params.receiver}
        </AccountLink>
      ),
    },
    ...('clawbackTarget' in params && params.clawbackTarget
      ? [
          {
            dt: 'Clawback target',
            dd: (
              <AccountLink className="text-primary underline" address={params.clawbackTarget}>
                {params.clawbackTarget}
              </AccountLink>
            ),
          },
        ]
      : []),
    ...('closeAssetTo' in params && params.closeAssetTo
      ? [
          {
            dt: 'Close remainder to',
            dd: (
              <AccountLink className="text-primary underline" address={params.closeAssetTo}>
                {params.closeAssetTo}
              </AccountLink>
            ),
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
            dd: (
              <AssetIdLink className="text-primary underline" assetId={Number(params.assetId)}>
                {Number(params.assetId)}
              </AssetIdLink>
            ),
          },
        ]
      : []),
    ...('assetName' in params && params.assetName ? [{ dt: 'Asset name', dd: params.assetName }] : []),
    ...('unitName' in params && params.unitName ? [{ dt: 'Unit name', dd: params.unitName }] : []),
    ...('total' in params && params.total ? [{ dt: 'Total', dd: params.total }] : []),
    ...('decimals' in params && params.decimals !== undefined ? [{ dt: 'Decimals', dd: params.decimals }] : []),
    {
      dt: transaction.type === BuildableTransactionType.AssetCreate ? 'Creator' : 'Sender',
      dd: (
        <AccountLink className="text-primary underline" address={params.sender}>
          {params.sender}
        </AccountLink>
      ),
    },
    ...('manager' in params && params.manager
      ? [
          {
            dt: 'Manager',
            dd: (
              <AccountLink className="text-primary underline" address={params.manager}>
                {params.manager}
              </AccountLink>
            ),
          },
        ]
      : []),
    ...('reserve' in params && params.reserve
      ? [
          {
            dt: 'Reserve',
            dd: (
              <AccountLink className="text-primary underline" address={params.reserve}>
                {params.reserve}
              </AccountLink>
            ),
          },
        ]
      : []),
    ...('freeze' in params && params.freeze
      ? [
          {
            dt: 'Freeze',
            dd: (
              <AccountLink className="text-primary underline" address={params.freeze}>
                {params.freeze}
              </AccountLink>
            ),
          },
        ]
      : []),
    ...('clawback' in params && params.clawback
      ? [
          {
            dt: 'Clawback',
            dd: (
              <AccountLink className="text-primary underline" address={params.clawback}>
                {params.clawback}
              </AccountLink>
            ),
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
      dd: (
        <AssetIdLink className="text-primary underline" assetId={Number(params.assetId)}>
          {Number(params.assetId)}
        </AssetIdLink>
      ),
    },
    {
      dt: 'Sender',
      dd: (
        <AccountLink className="text-primary underline" address={params.sender}>
          {params.sender}
        </AccountLink>
      ),
    },
    ...('account' in params && params.account
      ? [
          {
            dt: 'Freeze target',
            dd: (
              <AccountLink className="text-primary underline" address={params.account}>
                {params.account}
              </AccountLink>
            ),
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
      dd: (
        <AccountLink className="text-primary underline" address={params.sender}>
          {params.sender}
        </AccountLink>
      ),
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
  type: algosdk.ABIArgumentType,
  argIndex: number,
  args: MethodCallArg[],
  transactionPositions: TransactionPositionsInGroup,
  onEditTransaction: (transaction: BuildTransactionResult | PlaceholderTransaction) => Promise<void>
) => {
  const arg = args[argIndex]
  if (algosdk.abiTypeIsTransaction(type)) {
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
  if (arg === undefined) {
    return 'Not set'
  }
  const abiValue = getAbiValue(type, arg as algosdk.ABIValue)
  return <AbiValue abiValue={abiValue} />
}

const asAppCallTransaction = (transaction: BuildAppCallTransactionResult): DescriptionListItems => {
  const params = asAppCallTransactionParams(transaction)

  return [
    ...(params.appId !== 0n
      ? [
          {
            dt: 'Application ID',
            dd: (
              <ApplicationLink className="text-primary underline" applicationId={Number(params.appId)}>
                {Number(params.appId)}
              </ApplicationLink>
            ),
          },
        ]
      : []),
    {
      dt: 'On complete',
      dd: asOnCompleteLabel(params.onComplete ?? algosdk.OnApplicationComplete.NoOpOC),
    },
    {
      dt: 'Sender',
      dd: (
        <AccountLink className="text-primary underline" address={params.sender}>
          {params.sender}
        </AccountLink>
      ),
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
            dd: (
              <ApplicationLink className="text-primary underline" applicationId={Number(params.appId)}>
                {Number(params.appId)}
              </ApplicationLink>
            ),
          },
        ]
      : []),
    ...(transaction.method ? [{ dt: 'Method', dd: transaction.method.name }] : []),
    {
      dt: 'On complete',
      dd: asOnCompleteLabel(params.onComplete ?? algosdk.OnApplicationComplete.NoOpOC),
    },
    {
      dt: 'Sender',
      dd: (
        <AccountLink className="text-primary underline" address={params.sender}>
          {params.sender}
        </AccountLink>
      ),
    },
    ...(transaction.method.args.length > 0
      ? [
          {
            dt: 'Arguments',
            dd: (
              <ol>
                {transaction.method.args.map((arg, index) => (
                  <li key={index} className="truncate">
                    <span className="float-left mr-1.5">{arg.name ? arg.name : `Arg ${index + 1}`}: </span>
                    {asMethodArg(arg.type, index, transaction.methodArgs!, transactionPositions, onEditTransaction)}
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
                      <AccountLink className="text-primary underline" address={address}>
                        {address}
                      </AccountLink>
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
                      <AssetIdLink className="text-primary underline" assetId={Number(assetId)}>
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
                      <ApplicationLink className="text-primary underline" applicationId={Number(appId)}>
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
                  {boxes?.map((boxKey, index, array) => (
                    <li key={index} className="truncate">
                      {boxKey.toString()}
                      {index < array.length - 1 ? <span>{', '}</span> : null}
                    </li>
                  ))}
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
