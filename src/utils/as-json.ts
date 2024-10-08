export const asJson = (value: unknown) => JSON.stringify(value, (_, v) => (typeof v === 'bigint' ? v.toString() : v), 2)
