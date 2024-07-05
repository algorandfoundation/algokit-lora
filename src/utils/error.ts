export const asError = (error: unknown) => {
  return error instanceof Error
    ? error
    : error instanceof Object && 'error' in error && error.error instanceof Error
      ? error.error
      : new Error(String(error))
}

export const is404 = (error: Error) => 'status' in error && error.status === 404

export const is400 = (error: Error) => 'status' in error && error.status === 400
