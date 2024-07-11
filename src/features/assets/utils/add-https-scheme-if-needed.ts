export const addHttpsSchemeIfNeeded = (url: string): string => {
  return !url.startsWith('http') ? `https://${url}` : url
}
