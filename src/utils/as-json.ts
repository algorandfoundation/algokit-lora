export const asJson = (transactionResult: unknown) =>
  JSON.stringify(transactionResult, (_, v) => (typeof v === 'bigint' ? v.toString() : v), 2)
