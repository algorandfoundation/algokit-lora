import {
  AppCallTransaction,
  AppCallTransactionSubType,
  AssetConfigTransaction,
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
  TransactionGraphAccountVertical,
  TransactionGraphApplicationVertical,
  TransactionGraphHorizontal,
  TransactionGraphVertical,
  TransactionGraphVisualization,
  TransactionGraphVisualizationDescription,
  TransactionGraphVisualizationDescriptionType,
  TransactionGraphVisualizationType,
  TransactionVisualisationFromTo,
} from '@/features/transactions-graph'
import { isDefined } from '@/utils/is-defined'
import { Address } from '@/features/accounts/data/types'

export const getHorizontalsForTransaction = (
  transaction: Transaction | InnerTransaction,
  verticals: TransactionGraphVertical[],
  ancestors: TransactionGraphHorizontal[],
  hasNextSibling: boolean,
  depth: number
): TransactionGraphHorizontal[] => {
  const parent = ancestors.length > 0 ? ancestors[ancestors.length - 1] : undefined
  const visualizations = getTransactionVisualizations(transaction, verticals, parent)
  const rows = visualizations.map<TransactionGraphHorizontal>((visualization, index) => ({
    transaction,
    visualization: visualization,
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

const getTransactionVisualizations = (
  transaction: Transaction | InnerTransaction,
  verticals: TransactionGraphVertical[],
  parent?: TransactionGraphHorizontal
): TransactionGraphVisualization[] => {
  switch (transaction.type) {
    case TransactionType.AppCall:
      return getAppCallTransactionVisualizations(transaction, verticals, parent)
    case TransactionType.AssetConfig:
      return getAssetConfigTransactionVisualizations(transaction, verticals, parent)
    case TransactionType.AssetFreeze:
      return getAssetFreezeTransactionVisualizations(transaction, verticals, parent)
    case TransactionType.AssetTransfer:
      return getAssetTransferTransactionVisualizations(transaction, verticals, parent)
    case TransactionType.KeyReg:
      return getKeyRegTransactionVisualizations(transaction, verticals, parent)
    case TransactionType.Payment:
      return getPaymentTransactionVisualizations(transaction, verticals, parent)
    case TransactionType.StateProof:
      return getStateProofTransactionVisualizations(transaction, verticals)
  }
}

const getAppCallTransactionVisualizations = (
  transaction: AppCallTransaction | InnerAppCallTransaction,
  verticals: TransactionGraphVertical[],
  parent?: TransactionGraphHorizontal
): TransactionGraphVisualization[] => {
  const from = parent
    ? calculateFromWithParent(transaction.sender, verticals, parent)
    : calculateFromWithoutParent(transaction.sender, verticals)
  const to =
    transaction.subType === AppCallTransactionSubType.OpUp
      ? {
          verticalId: verticals.find((c) => c.type === 'OpUp')?.id ?? -1,
        }
      : {
          verticalId: verticals.find((c) => c.type === 'Application' && transaction.applicationId === c.applicationId)?.id ?? -1,
        }

  return [asTransactionGraphVisualization(from, to, { type: TransactionGraphVisualizationDescriptionType.ApplicationCall })]
}

const getAssetConfigTransactionVisualizations = (
  transaction: AssetConfigTransaction | InnerAssetConfigTransaction,
  verticals: TransactionGraphVertical[],
  parent?: TransactionGraphHorizontal
): TransactionGraphVisualization[] => {
  const from = parent
    ? calculateFromWithParent(transaction.sender, verticals, parent)
    : calculateFromWithoutParent(transaction.sender, verticals)
  const to = {
    verticalId: verticals.find((c) => c.type === 'Asset' && transaction.assetId === c.assetId)?.id ?? -1,
  }

  return [asTransactionGraphVisualization(from, to, { type: TransactionGraphVisualizationDescriptionType.AssetConfig })]
}

const getAssetFreezeTransactionVisualizations = (
  transaction: AssetFreezeTransaction | InnerAssetFreezeTransaction,
  verticals: TransactionGraphVertical[],
  parent?: TransactionGraphHorizontal
): TransactionGraphVisualization[] => {
  const from = parent
    ? calculateFromWithParent(transaction.sender, verticals, parent)
    : calculateFromWithoutParent(transaction.sender, verticals)
  const accountVertical = verticals.find(
    (c): c is TransactionGraphAccountVertical => c.type === 'Account' && transaction.address === c.accountAddress
  )
  const to = accountVertical
    ? {
        verticalId: accountVertical.id,
        accountNumber: accountVertical.accountNumber,
      }
    : fallbackFromTo

  return [asTransactionGraphVisualization(from, to, { type: TransactionGraphVisualizationDescriptionType.AssetFreeze })]
}

const getAssetTransferTransactionVisualizations = (
  transaction: AssetTransferTransaction | InnerAssetTransferTransaction,
  verticals: TransactionGraphVertical[],
  parent?: TransactionGraphHorizontal
): TransactionGraphVisualization[] => {
  let closeOutVisualisation: TransactionGraphVisualization | undefined = undefined
  if (transaction.closeRemainder) {
    closeOutVisualisation = getVisualisationForAssetTransferOrPaymentTransaction({
      sender: transaction.sender,
      receiver: transaction.closeRemainder.to,
      verticals,
      parent,
      description: {
        type: TransactionGraphVisualizationDescriptionType.AssetTransferRemainder,
        amount: transaction.closeRemainder.amount,
        asset: transaction.asset,
      },
    })
  }

  if (transaction.subType === AssetTransferTransactionSubType.Clawback) {
    const clawbackVisualisation = getVisualisationForAssetTransferOrPaymentTransaction({
      sender: transaction.sender,
      receiver: transaction.clawbackFrom!,
      verticals,
      parent,
      description: {
        type: TransactionGraphVisualizationDescriptionType.Clawback,
        amount: transaction.amount,
        asset: transaction.asset,
      },
    })
    const transferVisualisation = getVisualisationForAssetTransferOrPaymentTransaction({
      sender: transaction.clawbackFrom!,
      receiver: transaction.receiver,
      verticals,
      parent,
      description: {
        type: TransactionGraphVisualizationDescriptionType.AssetTransfer,
        amount: transaction.amount,
        asset: transaction.asset,
      },
    })
    return [clawbackVisualisation, transferVisualisation, closeOutVisualisation].filter(isDefined)
  } else {
    const transferVisualisation = getVisualisationForAssetTransferOrPaymentTransaction({
      sender: transaction.sender,
      receiver: transaction.receiver,
      verticals,
      parent,
      description: {
        type: TransactionGraphVisualizationDescriptionType.AssetTransfer,
        amount: transaction.amount,
        asset: transaction.asset,
      },
    })
    return [transferVisualisation, closeOutVisualisation].filter(isDefined)
  }
}

const getKeyRegTransactionVisualizations = (
  transaction: KeyRegTransaction | InnerKeyRegTransaction,
  verticals: TransactionGraphVertical[],
  parent?: TransactionGraphHorizontal
): TransactionGraphVisualization[] => {
  const from = parent
    ? calculateFromWithParent(transaction.sender, verticals, parent)
    : calculateFromWithoutParent(transaction.sender, verticals)

  return [
    {
      fromVerticalIndex: from.verticalId,
      fromAccountIndex: from.accountNumber,
      shape: TransactionGraphVisualizationType.Point,
      description: {
        type: TransactionGraphVisualizationDescriptionType.KeyReg,
      },
    },
  ]
}

const getPaymentTransactionVisualizations = (
  transaction: PaymentTransaction | InnerPaymentTransaction,
  verticals: TransactionGraphVertical[],
  parent?: TransactionGraphHorizontal
): TransactionGraphVisualization[] => {
  const paymentVisualisation = getVisualisationForAssetTransferOrPaymentTransaction({
    sender: transaction.sender,
    receiver: transaction.receiver,
    verticals,
    description: {
      type: TransactionGraphVisualizationDescriptionType.Payment,
      amount: transaction.amount,
    },
    parent,
  })

  if (transaction.closeRemainder) {
    const closeOutVisualisation = getVisualisationForAssetTransferOrPaymentTransaction({
      sender: transaction.sender,
      receiver: transaction.closeRemainder.to,
      verticals,
      description: {
        type: TransactionGraphVisualizationDescriptionType.PaymentTransferRemainder,
        amount: transaction.closeRemainder.amount,
      },
      parent,
    })
    return [paymentVisualisation, closeOutVisualisation]
  } else {
    return [paymentVisualisation]
  }
}

const getVisualisationForAssetTransferOrPaymentTransaction = ({
  sender,
  receiver,
  verticals,
  description,
  parent,
}: {
  sender: Address
  receiver: Address
  verticals: TransactionGraphVertical[]
  description: TransactionGraphVisualizationDescription
  parent?: TransactionGraphHorizontal
}): TransactionGraphVisualization => {
  const from = parent ? calculateFromWithParent(sender, verticals, parent) : calculateFromWithoutParent(sender, verticals)

  const toAccountVertical = verticals.find(
    (c): c is TransactionGraphAccountVertical => c.type === 'Account' && c.accountAddress === receiver
  )
  const toApplicationVertical = verticals.find(
    (c): c is TransactionGraphApplicationVertical => c.type === 'Application' && c.linkedAccount.accountAddress === receiver
  )
  let to = fallbackFromTo
  if (toAccountVertical) {
    to = {
      verticalId: toAccountVertical.id,
      accountNumber: toAccountVertical.accountNumber,
    }
  }
  if (toApplicationVertical) {
    to = {
      verticalId: toApplicationVertical.id,
      accountNumber: toApplicationVertical.linkedAccount.accountNumber,
    }
  }

  return asTransactionGraphVisualization(from, to, description)
}

const getStateProofTransactionVisualizations = (
  transaction: StateProofTransaction,
  verticals: TransactionGraphVertical[]
): TransactionGraphVisualization[] => {
  const from = calculateFromWithoutParent(transaction.sender, verticals)

  return [
    {
      fromVerticalIndex: from.verticalId,
      fromAccountIndex: from.accountNumber,
      shape: TransactionGraphVisualizationType.Point,
      description: {
        type: TransactionGraphVisualizationDescriptionType.StateProof,
      },
    },
  ]
}

const asTransactionGraphVisualization = (
  from: TransactionVisualisationFromTo,
  to: TransactionVisualisationFromTo,
  description: TransactionGraphVisualizationDescription
): TransactionGraphVisualization => {
  if (from.verticalId === to.verticalId) {
    return {
      fromVerticalIndex: from.verticalId,
      fromAccountIndex: from.accountNumber,
      shape: TransactionGraphVisualizationType.SelfLoop,
      description,
    }
  }

  const direction = from.verticalId < to.verticalId ? 'leftToRight' : 'rightToLeft'

  return {
    fromVerticalIndex: Math.min(from.verticalId, to.verticalId),
    fromAccountIndex: from.accountNumber,
    toVerticalIndex: Math.max(from.verticalId, to.verticalId),
    toAccountIndex: to.accountNumber,
    direction: direction,
    shape: TransactionGraphVisualizationType.Vector,
    description,
  }
}

const calculateFromWithoutParent = (sender: Address, verticals: TransactionGraphVertical[]): TransactionVisualisationFromTo => {
  // If the transaction is not a child, it is sent an individual account or an application account
  const accountVertical = verticals.find((c): c is TransactionGraphAccountVertical => c.type === 'Account' && sender === c.accountAddress)
  if (accountVertical) {
    return {
      verticalId: accountVertical.id,
      accountNumber: accountVertical.accountNumber,
    }
  }

  const applicationVertical = verticals.find(
    (c): c is TransactionGraphApplicationVertical => c.type === 'Application' && sender === c.linkedAccount.accountAddress
  )
  if (applicationVertical) {
    return {
      verticalId: applicationVertical.id,
      accountNumber: applicationVertical.linkedAccount.accountNumber,
    }
  }
  return fallbackFromTo
}

const calculateFromWithParent = (
  sender: Address,
  verticals: TransactionGraphVertical[],
  parent: TransactionGraphHorizontal
): TransactionVisualisationFromTo => {
  // If the transaction is child, the parent transaction must be an application call
  // The "from" must be the parent application call transaction
  const parentAppCallTransaction = parent.transaction as AppCallTransaction
  const applicationVertical = verticals.find(
    (c): c is TransactionGraphApplicationVertical => c.type === 'Application' && c.applicationId === parentAppCallTransaction.applicationId
  )
  if (applicationVertical) {
    return {
      verticalId: applicationVertical.id,
      accountNumber:
        applicationVertical.linkedAccount.accountAddress === sender
          ? applicationVertical.linkedAccount.accountNumber
          : applicationVertical.rekeyedAccounts.find((account) => account.accountAddress === sender)?.accountNumber,
    }
  }
  return fallbackFromTo
}
