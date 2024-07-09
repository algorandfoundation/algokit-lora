import { isString } from '@/utils/is-string'

export const asError = (error: unknown) => {
  if (error instanceof Error) {
    return error
  }
  if (error instanceof Object && 'error' in error && error.error instanceof Error) {
    return error.error
  }
  if (error instanceof Object && 'message' in error && isString(error.message)) {
    return new Error(error.message)
  }
  return new Error(String(error))
}

export const is404 = (error: Error) => 'status' in error && error.status === 404

export const is400 = (error: Error) => 'status' in error && error.status === 400
