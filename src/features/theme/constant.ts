export const themeConstants = {
  toggleButtonName: 'Toggle theme',
}

export const transactionPageConstants = {
  title: 'Transaction',
  notFoundMessage: 'Transaction not found',
  invalidIdMessage: 'Transaction Id is invalid',
  failedToLoadMessage: 'Transaction failed to load',
  labels: {
    transactionId: 'Transaction ID',
    type: 'Type',
    timestamp: 'Timestamp',
    block: 'Block',
    group: 'Group',
    fee: 'Fee',
    sender: 'Sender',
    receiver: 'Receiver',
    amount: 'Amount',
    viewTransaction: 'View Transaction',
    visual: 'Visual',
    table: 'Table',
    signature: {
      sig: {
        version: 'Version',
        signer: 'Signer',
      },
      multisig: {
        version: 'Version',
        threshold: 'Threshold',
        subsigners: 'Subsigners',
      },
      logicsig: 'Logic',
    },
  },
}
