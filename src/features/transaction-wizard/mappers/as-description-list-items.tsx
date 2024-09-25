import algosdk from 'algosdk'
import { DescriptionList, DescriptionListItems } from '@/features/common/components/description-list'
import {
  BuildableTransactionType,
  BuildAppCallTransactionResult,
  BuildAssetClawbackTransactionResult,
  BuildAssetOptInTransactionResult,
  BuildAssetOptOutTransactionResult,
  BuildAssetTransferTransactionResult,
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
  if (
    transaction.type === BuildableTransactionType.AssetTransfer ||
    transaction.type === BuildableTransactionType.AssetOptIn ||
    transaction.type === BuildableTransactionType.AssetOptOut ||
    transaction.type === BuildableTransactionType.AssetClawback
  ) {
    return asAssetTransferTransaction(transaction)
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
  let args: JSX.Element = <></>
  if (transaction.rawArgs) {
    args = <DescriptionList items={transaction.rawArgs.map((arg, index) => ({ dt: `Arg ${index}`, dd: arg }))} />
  } else if (transaction.method && transaction.methodArgs && transaction.methodArgs.length > 0) {
    args = (
      <DescriptionList
        items={transaction.method.args.map((arg, index) => {
          return {
            dt: arg.name ? arg.name : `Arg ${index}`,
            dd: asMethodArg(arg.type, transaction.methodArgs![index]),
          }
        })}
      />
    )
  }

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
      dd: args,
    },
    ...asNoteItem(transaction.note),
    ...asFeeItem(transaction.fee),
    ...asValidRoundsItem(transaction.validRounds),
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
