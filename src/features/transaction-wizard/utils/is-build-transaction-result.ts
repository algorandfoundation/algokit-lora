import { BuildTransactionResult, PlaceholderTransaction } from '../models'

export const isBuildTransactionResult = (arg: BuildTransactionResult | PlaceholderTransaction): arg is BuildTransactionResult => {
  return typeof arg === 'object' && 'type' in arg
}

export const isPlaceholderTransaction = (arg: BuildTransactionResult | PlaceholderTransaction): arg is PlaceholderTransaction => {
  return typeof arg === 'object' && 'targetType' in arg
}
