export const isDefined = <T>(x: T): x is Exclude<T, undefined> => x !== undefined

export const isNotNullOrUndefined = <T>(x: T): x is Exclude<T, undefined | null> => x !== undefined && x !== null
