import { MethodCallArg, BuildTransactionResult, BuildableTransactionType, PlaceholderTransaction, FulfilledByTransaction } from '../models'

export const isBuildTransactionResult = (arg: MethodCallArg): arg is BuildTransactionResult => {
  return (
    typeof arg === 'object' &&
    arg !== null &&
    'type' in arg &&
    'id' in arg &&
    'sender' in arg &&
    !([BuildableTransactionType.Placeholder, BuildableTransactionType.Fulfilled] as string[]).includes((arg as { type: string }).type)
  )
}

export const isPlaceholderTransaction = (arg: MethodCallArg): arg is PlaceholderTransaction => {
  return (
    typeof arg === 'object' &&
    arg !== null &&
    'type' in arg &&
    'id' in arg &&
    (arg as { type: string }).type === BuildableTransactionType.Placeholder
  )
}

export const isFulfilledByTransaction = (arg: MethodCallArg): arg is FulfilledByTransaction => {
  return (
    typeof arg === 'object' &&
    arg !== null &&
    'type' in arg &&
    'id' in arg &&
    'fulfilledById' in arg &&
    (arg as { type: string }).type === BuildableTransactionType.Fulfilled
  )
}

/**
 * Check if arg is any transaction-like object (BuildTransactionResult, PlaceholderTransaction, or FulfilledByTransaction)
 */
export const isTransactionArg = (arg: MethodCallArg): arg is BuildTransactionResult | PlaceholderTransaction | FulfilledByTransaction => {
  return isBuildTransactionResult(arg) || isPlaceholderTransaction(arg) || isFulfilledByTransaction(arg)
}
