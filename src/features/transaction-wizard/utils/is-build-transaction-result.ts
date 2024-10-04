import { MethodCallArg, BuildTransactionResult } from '../models'

// TODO: PD - this is not right anymore, consider the placeholders
export const isBuildTransactionResult = (arg: MethodCallArg): arg is BuildTransactionResult => {
  return typeof arg === 'object' && 'type' in arg
}
