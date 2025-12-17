/* eslint-disable @typescript-eslint/no-explicit-any */

type EncodableLike = {
  getEncodingSchema?: unknown
  toEncodingData?: unknown
}

export const removeEncodableMethods = <T extends EncodableLike | object>(obj: T): Omit<T, 'getEncodingSchema' | 'toEncodingData'> => {
  if (!obj) {
    return obj as Omit<T, 'getEncodingSchema' | 'toEncodingData'>
  }

  const { getEncodingSchema, toEncodingData, ...rest } = obj as EncodableLike

  // Recursively clean nested objects
  const cleaned = { ...rest } as Omit<T, 'getEncodingSchema' | 'toEncodingData'>
  for (const [key, value] of Object.entries(cleaned)) {
    if (value && isEncodable(value)) {
      ;(cleaned as any)[key] = removeEncodableMethods(value)
    }
    if (value && Array.isArray(value)) {
      ;(cleaned as any)[key] = value.map((item) => (isEncodable(item) ? removeEncodableMethods(item) : item))
    }
  }

  return cleaned
}

const isEncodable = (value: unknown): value is EncodableLike => {
  return typeof value === 'object' && value !== null && ('getEncodingSchema' in value || 'toEncodingData' in value)
}
