function camelToKebabCase(str: string): string {
  return str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? '-' : '') + $.toLowerCase())
}

export function convertKeysToKebabCase(obj: Record<string, unknown>): Record<string, unknown> {
  if (obj === null || typeof obj !== 'object') return obj
  return Object.keys(obj).reduce(
    (acc, key) => {
      const kebabKey = camelToKebabCase(key)
      acc[kebabKey] = convertKeysToKebabCase(obj[key] as Record<string, unknown>)
      return acc
    },
    {} as Record<string, unknown>
  )
}
