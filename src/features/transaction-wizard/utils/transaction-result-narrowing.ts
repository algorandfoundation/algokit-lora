import { MethodCallArg, BuildTransactionResult, BuildableTransactionType, PlaceholderTransaction, FulfilledByTransaction } from '../models'

export const isBuildTransactionResult = (arg: MethodCallArg): arg is BuildTransactionResult => {
  return (
    typeof arg === 'object' &&
    'type' in arg &&
    ![BuildableTransactionType.Placeholder, BuildableTransactionType.Fulfilled].includes(arg.type)
  )
}

export const isPlaceholderTransaction = (arg: MethodCallArg): arg is PlaceholderTransaction => {
  return typeof arg === 'object' && 'type' in arg && arg.type === BuildableTransactionType.Placeholder
}

export const isFulfilledByTransaction = (arg: MethodCallArg): arg is FulfilledByTransaction => {
  return typeof arg === 'object' && 'type' in arg && arg.type === BuildableTransactionType.Fulfilled
}
