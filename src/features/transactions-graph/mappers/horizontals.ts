import {
  AppCallTransaction,
  AppCallTransactionSubType,
  AssetConfigTransaction,
  AssetConfigTransactionSubType,
  AssetFreezeTransaction,
  AssetTransferTransaction,
  AssetTransferTransactionSubType,
  InnerAppCallTransaction,
  InnerAssetConfigTransaction,
  InnerAssetFreezeTransaction,
  InnerAssetTransferTransaction,
  InnerKeyRegTransaction,
  InnerPaymentTransaction,
  InnerTransaction,
  KeyRegTransaction,
  PaymentTransaction,
  StateProofTransaction,
  Transaction,
  TransactionType,
} from '@/features/transactions/models'
import {
  fallbackFromTo,
  AccountVertical,
  ApplicationVertical,
  Horizontal,
  Vertical,
  Representation,
  Label,
  LabelType,
  RepresentationType,
  RepresentationFromTo,
} from '../models'
import { isDefined } from '@/utils/is-defined'
import { Address } from '@/features/accounts/data/types'

export const getHorizontalsForTransaction = (
  transaction: Transaction | InnerTransaction,
  verticals: Vertical[],
  ancestors: Horizontal[],
  hasNextSibling: boolean,
  depth: number
): Horizontal[] => {
  const parent = ancestors.length > 0 ? ancestors[ancestors.length - 1] : undefined
  const representations = getTransactionRepresentations(transaction, verticals, parent)
  const rows = representations.map<Horizontal>((representation, index) => ({
    transaction,
    representation,
    ancestors,
    hasNextSibling,
    depth,
    isSubHorizontal: index > 0,
  }))

  if (transaction.type === TransactionType.AppCall && transaction.innerTransactions.length > 0) {
    const firstRow = rows[0]
    return [
      ...rows,
      ...transaction.innerTransactions.flatMap((innerTxn, index) =>
        getHorizontalsForTransaction(
          innerTxn,
          verticals,
          [...ancestors, firstRow],
          index < transaction.innerTransactions.length - 1,
          depth + 1
        )
      ),
    ]
  }
  return rows
}

const getTransactionRepresentations = (
  transaction: Transaction | InnerTransaction,
  verticals: Vertical[],
  parent?: Horizontal
): Representation[] => {
  switch (transaction.type) {
    case TransactionType.AppCall:
      return getAppCallTransactionRepresentations(transaction, verticals, parent)
    case TransactionType.AssetConfig:
      return getAssetConfigTransactionRepresentations(transaction, verticals, parent)
    case TransactionType.AssetFreeze:
      return getAssetFreezeTransactionRepresentations(transaction, verticals, parent)
    case TransactionType.AssetTransfer:
      return getAssetTransferTransactionRepresentations(transaction, verticals, parent)
    case TransactionType.KeyReg:
      return getKeyRegTransactionRepresentations(transaction, verticals, parent)
    case TransactionType.Payment:
      return getPaymentTransactionRepresentations(transaction, verticals, parent)
    case TransactionType.StateProof:
      return getStateProofTransactionRepresentations(transaction, verticals)
  }
}

const getAppCallTransactionRepresentations = (
  transaction: AppCallTransaction | InnerAppCallTransaction,
  verticals: Vertical[],
  parent?: Horizontal
): Representation[] => {
  const from = parent
    ? calculateFromWithParent(transaction.sender, verticals, parent)
    : calculateFromWithoutParent(transaction.sender, verticals)
  const to = transaction.isOpUp
    ? {
        verticalId: verticals.find((c) => c.type === 'OpUp')?.id ?? -1,
      }
    : {
        verticalId: verticals.find((c) => c.type === 'Application' && transaction.applicationId === c.applicationId)?.id ?? -1,
      }

  const type = transaction.subType === AppCallTransactionSubType.Create ? LabelType.AppCreate : LabelType.AppCall
  return [asTransactionGraphRepresentation(from, to, { type })]
}

const getAssetConfigTransactionRepresentations = (
  transaction: AssetConfigTransaction | InnerAssetConfigTransaction,
  verticals: Vertical[],
  parent?: Horizontal
): Representation[] => {
  const from = parent
    ? calculateFromWithParent(transaction.sender, verticals, parent)
    : calculateFromWithoutParent(transaction.sender, verticals)
  const to = {
    verticalId: verticals.find((c) => c.type === 'Asset' && transaction.assetId === c.assetId)?.id ?? -1,
  }

  const type =
    transaction.subType === AssetConfigTransactionSubType.Reconfigure
      ? LabelType.AssetReconfigure
      : transaction.subType === AssetConfigTransactionSubType.Destroy
        ? LabelType.AssetDestroy
        : LabelType.AssetCreate

  return [
    asTransactionGraphRepresentation(from, to, {
      type,
    }),
  ]
}

const getAssetFreezeTransactionRepresentations = (
  transaction: AssetFreezeTransaction | InnerAssetFreezeTransaction,
  verticals: Vertical[],
  parent?: Horizontal
): Representation[] => {
  const from = parent
    ? calculateFromWithParent(transaction.sender, verticals, parent)
    : calculateFromWithoutParent(transaction.sender, verticals)
  const accountVertical = verticals.find((c): c is AccountVertical => c.type === 'Account' && transaction.address === c.accountAddress)
  const to = accountVertical
    ? {
        verticalId: accountVertical.id,
        accountNumber: accountVertical.accountNumber,
      }
    : fallbackFromTo

  return [asTransactionGraphRepresentation(from, to, { type: LabelType.AssetFreeze })]
}

const getAssetTransferTransactionRepresentations = (
  transaction: AssetTransferTransaction | InnerAssetTransferTransaction,
  verticals: Vertical[],
  parent?: Horizontal
): Representation[] => {
  const closeOutRepresentation = transaction.closeRemainder
    ? getRepresentationGivenSenderAndReceiver({
        sender: transaction.sender,
        receiver: transaction.closeRemainder.to,
        verticals,
        description: {
          type: LabelType.AssetTransferRemainder,
          amount: transaction.closeRemainder.amount,
          asset: transaction.asset,
        },
      })
    : undefined

  const sender =
    transaction.subType === AssetTransferTransactionSubType.Clawback && transaction.clawbackFrom
      ? transaction.clawbackFrom
      : transaction.sender
  const from = parent
    ? calculateFromWithParent(sender, verticals, parent)
    : calculateFromWithoutParent(sender, verticals, transaction.subType === AssetTransferTransactionSubType.Clawback)
  const to = getAccountOrApplicationByAddress(verticals, transaction.receiver)

  const transferRepresentation = asTransactionGraphRepresentation(from, to, {
    type: transaction.subType === AssetTransferTransactionSubType.Clawback ? LabelType.Clawback : LabelType.AssetTransfer,
    amount: transaction.amount,
    asset: transaction.asset,
  })

  return [transferRepresentation, closeOutRepresentation].filter(isDefined)
}

const getKeyRegTransactionRepresentations = (
  transaction: KeyRegTransaction | InnerKeyRegTransaction,
  verticals: Vertical[],
  parent?: Horizontal
): Representation[] => {
  const from = parent
    ? calculateFromWithParent(transaction.sender, verticals, parent)
    : calculateFromWithoutParent(transaction.sender, verticals)

  return [
    {
      fromVerticalIndex: from.verticalId,
      fromAccountIndex: from.accountNumber,
      type: RepresentationType.Point,
      label: {
        type: LabelType.KeyReg,
      },
    },
  ]
}

const getPaymentTransactionRepresentations = (
  transaction: PaymentTransaction | InnerPaymentTransaction,
  verticals: Vertical[],
  parent?: Horizontal
): Representation[] => {
  const from = parent
    ? calculateFromWithParent(transaction.sender, verticals, parent)
    : calculateFromWithoutParent(transaction.sender, verticals)
  const to = getAccountOrApplicationByAddress(verticals, transaction.receiver)

  const paymentRepresentation = asTransactionGraphRepresentation(from, to, {
    type: LabelType.Payment,
    amount: transaction.amount,
  })

  if (transaction.closeRemainder) {
    const closeOutRepresentation = getRepresentationGivenSenderAndReceiver({
      sender: transaction.sender,
      receiver: transaction.closeRemainder.to,
      verticals,
      description: {
        type: LabelType.PaymentTransferRemainder,
        amount: transaction.closeRemainder.amount,
      },
    })
    return [paymentRepresentation, closeOutRepresentation]
  } else {
    return [paymentRepresentation]
  }
}

function getAccountOrApplicationByAddress(verticals: Vertical[], address: string) {
  const accountVertical = verticals.find((c): c is AccountVertical => c.type === 'Account' && c.accountAddress === address)
  const applicationVertical = verticals.find(
    (c): c is ApplicationVertical => c.type === 'Application' && c.linkedAccount.accountAddress === address
  )
  let fromTo = fallbackFromTo
  if (accountVertical) {
    fromTo = {
      verticalId: accountVertical.id,
      accountNumber: accountVertical.accountNumber,
    }
  }
  if (applicationVertical) {
    fromTo = {
      verticalId: applicationVertical.id,
      accountNumber: applicationVertical.linkedAccount.accountNumber,
    }
  }
  return fromTo
}

const getRepresentationGivenSenderAndReceiver = ({
  sender,
  receiver,
  verticals,
  description,
}: {
  sender: Address
  receiver: Address
  verticals: Vertical[]
  description: Label
}): Representation => {
  const from = calculateFromWithoutParent(sender, verticals)
  const to = getAccountOrApplicationByAddress(verticals, receiver)

  return asTransactionGraphRepresentation(from, to, description)
}

const getStateProofTransactionRepresentations = (transaction: StateProofTransaction, verticals: Vertical[]): Representation[] => {
  const from = calculateFromWithoutParent(transaction.sender, verticals)

  return [
    {
      fromVerticalIndex: from.verticalId,
      fromAccountIndex: from.accountNumber,
      type: RepresentationType.Point,
      label: {
        type: LabelType.StateProof,
      },
    },
  ]
}

const asTransactionGraphRepresentation = (from: RepresentationFromTo, to: RepresentationFromTo, description: Label): Representation => {
  if (from.verticalId === to.verticalId) {
    return {
      fromVerticalIndex: from.verticalId,
      fromAccountIndex: from.accountNumber,
      toAccountIndex: to.accountNumber,
      type: RepresentationType.SelfLoop,
      label: description,
    }
  }

  const direction = from.verticalId < to.verticalId ? 'leftToRight' : 'rightToLeft'

  return {
    fromVerticalIndex: Math.min(from.verticalId, to.verticalId),
    fromAccountIndex: from.accountNumber,
    toVerticalIndex: Math.max(from.verticalId, to.verticalId),
    toAccountIndex: to.accountNumber,
    direction: direction,
    type: RepresentationType.Vector,
    label: description,
  }
}

const calculateFromWithoutParent = (
  sender: Address,
  verticals: Vertical[],
  useAssociatedAccountsVertical: boolean = false
): RepresentationFromTo => {
  // If the transaction is not a child, it is sent an individual account or an application account
  const accountVertical = useAssociatedAccountsVertical
    ? verticals.find(
        (c): c is AccountVertical => c.type === 'Account' && c.associatedAccounts.map((x) => x.accountAddress).includes(sender)
      )
    : verticals.find((c): c is AccountVertical => c.type === 'Account' && sender === c.accountAddress)

  if (accountVertical) {
    return {
      verticalId: accountVertical.id,
      accountNumber:
        accountVertical.accountAddress === sender
          ? accountVertical.accountNumber
          : accountVertical.associatedAccounts.find((x) => x.accountAddress === sender)?.accountNumber,
    }
  }

  const applicationVertical = verticals.find(
    (c): c is ApplicationVertical => c.type === 'Application' && sender === c.linkedAccount.accountAddress
  )
  if (applicationVertical) {
    return {
      verticalId: applicationVertical.id,
      accountNumber: applicationVertical.linkedAccount.accountNumber,
    }
  }
  return fallbackFromTo
}

const calculateFromWithParent = (sender: Address, verticals: Vertical[], parent: Horizontal): RepresentationFromTo => {
  // If the transaction is child, the parent transaction must be an application call
  // The "from" must be the parent application call transaction
  const parentAppCallTransaction = parent.transaction as AppCallTransaction
  const applicationVertical = verticals.find(
    (c): c is ApplicationVertical => c.type === 'Application' && c.applicationId === parentAppCallTransaction.applicationId
  )
  if (applicationVertical) {
    return {
      verticalId: applicationVertical.id,
      accountNumber:
        applicationVertical.linkedAccount.accountAddress === sender
          ? applicationVertical.linkedAccount.accountNumber
          : applicationVertical.associatedAccounts.find((account) => account.accountAddress === sender)?.accountNumber,
    }
  }
  return fallbackFromTo
}
