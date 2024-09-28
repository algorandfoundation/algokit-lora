import { MethodCallArg, BuildTransactionResult } from '../models'

export const isBuildTransactionResult = (arg: MethodCallArg): arg is BuildTransactionResult => {
  return typeof arg === 'object' && 'type' in arg
}
