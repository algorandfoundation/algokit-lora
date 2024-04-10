// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function invariant(condition: any, message: string): asserts condition {
  if (condition) return
  throw new InvariantError(message)
}

export class InvariantError extends Error {}
