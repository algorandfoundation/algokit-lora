import { MethodCallArg, BuildTransactionResult, PlaceholderTransaction } from '../models'

export const isBuildTransactionResult = (arg: MethodCallArg): arg is BuildTransactionResult => {
  return typeof arg === 'object' && 'type' in arg
}

export const isPlaceholderTransaction = (arg: MethodCallArg): arg is PlaceholderTransaction => {
  return typeof arg === 'object' && 'targetType' in arg
}
