import { MethodCallArg, BuildTransactionResult, BuildableTransactionType, PlaceholderTransaction, SatisifiedByTransaction } from '../models'

export const isBuildTransactionResult = (arg: MethodCallArg): arg is BuildTransactionResult => {
  return (
    typeof arg === 'object' &&
    'type' in arg &&
    ![BuildableTransactionType.Placeholder, BuildableTransactionType.SatisfiedBy].includes(arg.type)
  )
}

export const isPlaceholderTransaction = (arg: MethodCallArg): arg is PlaceholderTransaction => {
  return typeof arg === 'object' && 'type' in arg && arg.type === BuildableTransactionType.Placeholder
}

export const isSatisfiedByTransaction = (arg: MethodCallArg): arg is SatisifiedByTransaction => {
  return typeof arg === 'object' && 'type' in arg && arg.type === BuildableTransactionType.SatisfiedBy
}
