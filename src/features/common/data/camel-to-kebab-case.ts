export function camelToKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}
