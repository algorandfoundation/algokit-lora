export const asError = (error: unknown) => {
  return error instanceof Error ? error : new Error(String(error))
}

export const is404 = (error: Error) => 'status' in error && error.status === 404
