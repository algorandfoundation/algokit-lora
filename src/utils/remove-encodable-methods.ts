/* eslint-disable @typescript-eslint/no-explicit-any */


export const removeEncodableMethods = <T extends Encodable>(encodable: T): Omit<T, 'getEncodingSchema' | 'toEncodingData'> => {
  if (!encodable) {
    return encodable
  }

  const { getEncodingSchema, toEncodingData, ...rest } = encodable

  // Recursively clean nested objects
  const cleaned: Omit<T, 'getEncodingSchema' | 'toEncodingData'> = { ...rest }
  for (const [key, value] of Object.entries(cleaned)) {
    if (value && isEncodable(value)) {
      ;(cleaned as any)[key] = removeEncodableMethods(value as T)
    }
    if (value && Array.isArray(value)) {
      ;(cleaned as any)[key] = value.map((item) => (isEncodable(item) ? removeEncodableMethods(item) : item))
    }
  }

  return cleaned
}

const isEncodable = (value: unknown): value is Encodable => {
  return typeof value === 'object' && value !== null && 'getEncodingSchema' in value && 'toEncodingData' in value
}
