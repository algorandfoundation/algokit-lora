export const asJson = (indexerResult: unknown) => JSON.stringify(indexerResult, (_, v) => (typeof v === 'bigint' ? v.toString() : v), 2)
