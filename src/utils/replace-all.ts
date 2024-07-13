export const replaceAll = (str: string, search: string, replacement: string) => {
  return str.replace(new RegExp(search, 'g'), replacement)
}
